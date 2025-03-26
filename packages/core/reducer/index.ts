import { Reducer } from "react";
import { AppState, Config, Data } from "../types";
import { reduceData } from "./data";
import { PuckAction, SetAction } from "./actions";
import { reduceUi } from "./state";
import type { Content, OnAction } from "../types";
import { dataMap } from "../lib/data-map";
import {
  flattenAllSlots,
  flattenSlots,
  mergeSlots,
} from "../lib/flatten-slots";
import { AppStore, AppStoreApi } from "../store";

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
  appStore,
}: {
  config: UserConfig;
  record?: (appState: AppState<UserData>) => void;
  onAction?: OnAction<UserData>;
  appStore: AppStore;
}): StateReducer<UserData> {
  return storeInterceptor(
    (state, action) => {
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

      return { data, ui };
    },
    record,
    onAction
  );
}
