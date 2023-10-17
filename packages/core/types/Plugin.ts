import { ReactElement, ReactNode } from "react";
import { AppState } from "./Config";

export type Plugin = {
  renderRootFields?: (props: {
    children: ReactNode;
    state: AppState;
  }) => ReactElement<any>;
  renderRoot?: (props: {
    children: ReactNode;
    state: AppState;
  }) => ReactElement<any>;
  renderFields?: (props: {
    children: ReactNode;
    state: AppState;
  }) => ReactElement<any>;
};
