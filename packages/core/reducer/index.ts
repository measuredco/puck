import { Reducer } from "react";
import { AppState, Config } from "../types/Config";
import { reduceData } from "./data";
import { PuckAction, SetAction } from "./actions";
import { reduceUi } from "./state";

export * from "./actions";
export * from "./data";

export type ActionType = "insert" | "reorder";

export type StateReducer = Reducer<AppState, PuckAction>;

const storeInterceptor = (
  reducer: StateReducer,
  record?: (appState: AppState) => void
) => {
  return (state: AppState, action: PuckAction) => {
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

    return newAppState;
  };
};

export const setAction = (state: AppState, action: SetAction) => {
  if (typeof action.state === "object") {
    return {
      ...state,
      ...action.state,
    };
  }

  return { ...state, ...action.state(state) };
};

export const createReducer = ({
  config,
  record,
}: {
  config: Config<any>;
  record?: (appState: AppState) => void;
}): StateReducer =>
  storeInterceptor((state, action) => {
    const data = reduceData(state.data, action, config);
    const ui = reduceUi(state.ui, action);

    if (action.type === "set") {
      return setAction(state, action);
    }

    return { data, ui };
  }, record);
