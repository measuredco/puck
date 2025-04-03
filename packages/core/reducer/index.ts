import { Reducer } from "react";
import { AppState, Config, Data } from "../types";
import { reduceData, updateContent } from "./data";
import { PuckAction, ReplaceAction, SetAction } from "./actions";
import { reduceUi } from "./state";
import type { Content, OnAction } from "../types";
import { dataMap } from "../lib/data-map";
import {
  flattenAllSlots,
  flattenSlots,
  mergeSlots,
} from "../lib/flatten-slots";
import { AppStore, AppStoreApi } from "../store";
import { PrivateAppState } from "../types/Internal";
import { generateNodeIndex, generateZonesIndex } from "./indexes";
import { replace } from "../lib";
import { reduce } from "./reduce";

export * from "./actions";
export * from "./data";

export type ActionType = "insert" | "reorder";

export type StateReducer<UserData extends Data = Data> = Reducer<
  PrivateAppState<UserData>,
  PuckAction
>;

function storeInterceptor<UserData extends Data = Data>(
  reducer: StateReducer<UserData>,
  record?: (appState: AppState<UserData>) => void,
  onAction?: OnAction<UserData>
) {
  return (
    state: PrivateAppState<UserData>,
    action: PuckAction
  ): PrivateAppState<UserData> => {
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

export function createReducer<
  UserConfig extends Config,
  UserData extends Data
>({
  config,
  record,
  onAction,
  appStore,
}: {
  config: UserConfig;
  record?: (appState: AppState<UserData>) => void;
  onAction?: OnAction<UserData>;
  appStore: AppStore;
}): StateReducer<UserData> {
  return storeInterceptor(
    (state, action) => {
      console.log(action.type, state, reduce(state, action, appStore));
      return reduce(state, action, appStore);
      // Reduce data may use `data-map` internally to update slots
      let data = reduceData(state.data, action, appStore);
      let ui = reduceUi(state.ui, action);

      if (action.type === "set") {
        const setValue = setAction<UserData>(
          state,
          action as SetAction<UserData>
        );

        data = setValue.data;
        ui = setValue.ui;
      }

      const indexes = state.indexes;

      // TODO if not reusing replaceAction function, consider moving this back into separate reducer
      if (action.type === "replace") {
        const replaceValue = replaceAction(state, action);

        data = replaceValue.data;
        ui = replaceValue.ui;
      }

      console.log("action", action.type, action);

      if (action.type === "replace") {
        console.log("replace", action.data.props.id, action.data);
        indexes.nodes[action.data.props.id].data = action.data;
      }

      if (action.type === "insert") {
        indexes.nodes[action.data.props.id].data = action.data;
      }

      // const indexes = {
      //   nodes: generateNodeIndex({ ...state, data, ui }, config),
      //   zones: state.indexes.zones, //generateZonesIndex({ ...state, data, ui }),
      // };

      console.log(indexes);

      return { data, ui, indexes };
    },
    record,
    onAction
  );
}
