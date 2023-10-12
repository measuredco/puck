import { AppState } from "../types/Config";
import { PuckAction } from "./actions";

export const reduceState = (state: AppState, action: PuckAction) => {
  if (action.type === "setState") {
    return {
      ...state,
      ...action.state,
    };
  }

  return state;
};
