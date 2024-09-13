import { PuckAction } from "../../reducer";
import { AppState } from "./../AppState";
import { Data } from "./../Data";
import { Overrides } from "./Overrides";

export type Permissions = {
  drag: boolean;
  duplicate: boolean;
  delete: boolean;
  edit: boolean;
  insert: boolean;
} & Record<string, boolean>;

export type IframeConfig = {
  enabled?: boolean;
  waitForStyles?: boolean;
};

export type OnAction<UserData extends Data = Data> = (
  action: PuckAction,
  appState: AppState<UserData>,
  prevAppState: AppState<UserData>
) => void;

export type Plugin = {
  overrides: Partial<Overrides>;
};

export type History<D = any> = {
  state: D;
  id?: string;
};

type InitialHistoryAppend<AS = Partial<AppState>> = {
  histories: History<AS>[];
  index?: number;
  appendData?: true;
};

type InitialHistoryNoAppend<AS = Partial<AppState>> = {
  histories: [History<AS>, ...History<AS>[]]; // Array with minimum length of 1
  index?: number;
  appendData?: false;
};

export type InitialHistory<AS = Partial<AppState>> =
  | InitialHistoryAppend<AS>
  | InitialHistoryNoAppend<AS>;

export * from "./Viewports";

export type { Overrides };
