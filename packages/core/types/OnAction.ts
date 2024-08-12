import type { PuckAction } from "../reducer";
import type { AppState } from "./Config";

export type OnAction = (
  action: PuckAction,
  appState: AppState,
  prevAppState: AppState
) => void;
