import { ReactNode } from "react";
import { RenderFunc } from "./Overrides";

export type IframeConfig = {
  enabled?: boolean;
  initialContent?: string;
  wrapper?: RenderFunc<{ children: ReactNode }>;
};
