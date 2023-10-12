import { Reducer } from "react";
import { AppData, Config } from "../types/Config";
import { recordDiff } from "../lib/use-puck-history";
import { reduceData } from "./data";
import { PuckAction } from "./actions";
import { reduceState } from "./state";

export * from "./actions";
export * from "./data";

export type ActionType = "insert" | "reorder";

export type StateReducer = Reducer<AppData, PuckAction>;

const storeInterceptor = (reducer: StateReducer) => {
  return (appData: AppData, action: PuckAction) => {
    const newAppData = reducer(appData, action);

    const isValidType = ![
      "registerZone",
      "unregisterZone",
      "setData",
      "setState",
      "set",
    ].includes(action.type);

    if (
      typeof action.recordHistory !== "undefined"
        ? action.recordHistory
        : isValidType
    ) {
      recordDiff(newAppData);
    }

    return newAppData;
  };
};

export const createReducer = ({ config }: { config: Config }): StateReducer =>
  storeInterceptor((appData, action) => {
    const data = reduceData(appData.data, action, config);
    const state = reduceState(appData.state, action);

    if (action.type === "set") {
      return { ...appData, ...action.appData };
    }

    return { data, state: state };
  });
