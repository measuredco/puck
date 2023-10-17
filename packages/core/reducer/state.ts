import { UiState } from "../types/Config";
import { PuckAction } from "./actions";

export const reduceState = (ui: UiState, action: PuckAction) => {
  if (action.type === "setUi") {
    return {
      ...ui,
      ...action.ui,
    };
  }

  return ui;
};
