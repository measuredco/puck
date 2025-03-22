import { Reducer } from "react";
import { AppState, Config, Data } from "../types";
import { reduceData } from "./data";
import { PuckAction, SetAction } from "./actions";
import { reduceUi } from "./state";
import type { Content, OnAction } from "../types";
import { dataMap } from "../lib/data-map";
import { flattenSlots } from "../lib/flatten-slots";

export * from "./actions";
export * from "./data";

export type ActionType = "insert" | "reorder";

export type StateReducer<UserData extends Data = Data> = Reducer<
  AppState<UserData>,
  PuckAction
>;

function storeInterceptor<UserData extends Data = Data>(
  reducer: StateReducer<UserData>,
  record?: (appState: AppState<UserData>) => void,
  onAction?: OnAction<UserData>
) {
  return (
    state: AppState<UserData>,
    action: PuckAction
  ): AppState<UserData> => {
    const newAppState = reducer(state, action);

    const isValidType = ![
      "registerZone",
      "unregisterZone",
      "setData",
      "setUi",
      "set",
    ].includes(action.type);

    if (
      typeof action.recordHistory !== "undefined"
        ? action.recordHistory
        : isValidType
    ) {
      if (record) record(newAppState);
    }

    onAction?.(action, newAppState, state);

    return newAppState;
  };
}

export const setAction = <UserData extends Data>(
  state: AppState<UserData>,
  action: SetAction<UserData>
): AppState<UserData> => {
  if (typeof action.state === "object") {
    return {
      ...state,
      ...action.state,
    };
  }

  return { ...state, ...action.state(state) };
};

export function createReducer<
  UserConfig extends Config,
  UserData extends Data
>({
  config,
  record,
  onAction,
}: {
  config: UserConfig;
  record?: (appState: AppState<UserData>) => void;
  onAction?: OnAction<UserData>;
}): StateReducer<UserData> {
  return storeInterceptor(
    (state, action) => {
      let data = reduceData(state.data, action, config);
      let ui = reduceUi(state.ui, action);

      if (action.type === "set") {
        const setValue = setAction<UserData>(
          state,
          action as SetAction<UserData>
        );

        data = setValue.data;
        ui = setValue.ui;
      }

      // Synchonize slots and zones
      const oldSlots = flattenSlots(config, state.data);
      const newSlots = flattenSlots(config, data);

      const slotZones: Record<string, Content> = {};

      Object.keys(newSlots).forEach((slotKey) => {
        const newSlot = newSlots[slotKey];
        const oldSlot = oldSlots[slotKey];

        // When duplicating, we don't merge slots to enable new IDs to propagate
        if (newSlot !== oldSlot && action.type !== "duplicate") {
          // Write change to zones
          slotZones[slotKey] = newSlot;
        } else {
          // Write change to slot
        }
      });

      const zones = data.zones || {};

      const dataWithZones = dataMap(
        {
          ...data,
          zones: { ...data.zones, ...slotZones },
        },
        (item) => {
          const componentType = "type" in item ? item.type : "root";

          const configForComponent =
            componentType === "root"
              ? config.root
              : config.components[componentType];

          if (!configForComponent?.fields) return item;

          const propKeys = Object.keys(configForComponent.fields || {});

          return propKeys.reduce((acc, propKey) => {
            const field = configForComponent.fields![propKey];

            if (field.type === "slot") {
              const id =
                item.props && "id" in item.props ? item.props.id : "root";

              return {
                ...acc,
                props: {
                  ...acc.props,
                  [propKey]: zones[`${id}:${propKey}`],
                },
              };
            }

            return acc;
          }, item);
        }
      ) as UserData;

      return { data: dataWithZones, ui };
    },
    record,
    onAction
  );
}
