import { ReactElement, ReactNode } from "react";
import { Data } from "./Config";

export type Plugin = {
  renderPageFields?: (props: {
    children: ReactNode;
    data: Data;
  }) => ReactElement<any>;
  renderPage?: (props: {
    children: ReactNode;
    data: Data;
  }) => ReactElement<any>;
  renderFields?: (props: {
    children: ReactNode;
    data: Data;
  }) => ReactElement<any>;
};
