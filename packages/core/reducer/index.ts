import { Reducer } from "react";
import { AppData, Config } from "../types/Config";
import { recordDiff } from "../lib/use-puck-history";
import { reduceData } from "./data";
import { PuckAction } from "./actions";

export * from "./actions";
export * from "./data";

export type ActionType = "insert" | "reorder";

export type StateReducer = Reducer<AppData, PuckAction>;

const storeInterceptor = (reducer: StateReducer) => {
  return (data, action) => {
    const newAppData = reducer(data, action);

    if (!["registerZone", "unregisterZone", "setData"].includes(action.type)) {
      recordDiff(newAppData);
    }

    return newAppData;
  };
};

export const createReducer = ({ config }: { config: Config }): StateReducer =>
  storeInterceptor((appData, action) => {
    const data = reduceData(appData.data, action, config);

    return { data, state: {} };
  });
