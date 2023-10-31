import { Reducer } from "react";
import { AppState, Config } from "../types/Config";
import { recordDiff } from "../lib/use-puck-history";
import { reduceData } from "./data";
import { PuckAction } from "./actions";
import { reduceUi } from "./state";

export * from "./actions";
export * from "./data";

export type ActionType = "insert" | "reorder";

export type StateReducer = Reducer<AppState, PuckAction>;

const storeInterceptor = (reducer: StateReducer) => {
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
      recordDiff(newAppState);
    }

    return newAppState;
  };
};

export const createReducer = ({
  config,
}: {
  config: Config<any>;
}): StateReducer =>
  storeInterceptor((state, action) => {
    const data = reduceData(state.data, action, config);
    const ui = reduceUi(state.ui, action);

    if (action.type === "set") {
      return { ...state, ...action.state };
    }

    return { data, ui };
  });
