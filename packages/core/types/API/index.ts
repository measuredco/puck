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
};

export type OnAction<UserData extends Data = Data> = (
  action: PuckAction,
  appState: AppState<UserData>,
  prevAppState: AppState<UserData>
) => void;

export type Plugin = {
  overrides: Partial<Overrides>;
};

export * from "./Viewports";

export type { Overrides };
