import { ReactElement, ReactNode } from "react";
import { AppState } from "./Config";
import { PuckAction } from "../reducer";

export type Plugin = {
  renderRootFields?: (props: {
    children: ReactNode;
    dispatch: (action: PuckAction) => void;
    state: AppState;
  }) => ReactElement<any>;
  renderRoot?: (props: {
    children: ReactNode;
    dispatch: (action: PuckAction) => void;
    state: AppState;
  }) => ReactElement<any>;
  renderFields?: (props: {
    children: ReactNode;
    dispatch: (action: PuckAction) => void;
    state: AppState;
  }) => ReactElement<any>;
};
