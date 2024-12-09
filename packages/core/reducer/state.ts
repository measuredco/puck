import { UiState } from "../types";
import { PuckAction } from "./actions";

export const reduceUi = (ui: UiState, action: PuckAction): UiState => {
  if (action.type === "setUi") {
    if (typeof action.ui === "object") {
      return {
        ...ui,
        ...action.ui,
      };
    }

    return {
      ...ui,
      ...action.ui(ui),
    };
  }

  if (action.type === "duplicate") {
    return {
      ...ui,
      itemSelector: { index: action.sourceIndex + 1, zone: action.sourceZone },
    };
  }

  return ui;
};
