import type { PuckAction } from "../reducer";
import type { AppState, Data } from "./Config";

export type OnAction<UserData extends Data = Data> = (
  action: PuckAction,
  appState: AppState<UserData>,
  prevAppState: AppState<UserData>
) => void;
