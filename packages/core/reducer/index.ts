import { Reducer } from "react";
import { AppState, Config, Data } from "../types";
import { PuckAction } from "./actions";
import type { OnAction } from "../types";
import { AppStore } from "../store";
import { PrivateAppState } from "../types/Internal";
import { reduce } from "./reduce";

export * from "./actions";
export * from "./reduce";

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

export function createReducer<UserData extends Data>({
  record,
  onAction,
  appStore,
}: {
  record?: (appState: AppState<UserData>) => void;
  onAction?: OnAction<UserData>;
  appStore: AppStore;
}): StateReducer<UserData> {
  return storeInterceptor(
    (state, action) => {
      const result = reduce(state, action, appStore);

      return result;
    },
    record,
    onAction
  );
}
