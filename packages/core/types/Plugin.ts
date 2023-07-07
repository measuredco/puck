import { ReactElement, ReactNode } from "react";
import { Data } from "./Config";

export type Plugin = {
  renderRootFields?: (props: {
    children: ReactNode;
    data: Data;
  }) => ReactElement<any>;
  renderRoot?: (props: {
    children: ReactNode;
    data: Data;
  }) => ReactElement<any>;
  renderFields?: (props: {
    children: ReactNode;
    data: Data;
  }) => ReactElement<any>;
};
