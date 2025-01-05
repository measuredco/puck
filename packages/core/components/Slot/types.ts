import { CSSProperties } from "react";
import { Config, Content, DragAxis } from "../../types";

export type SlotProps = {
  name: string;
  areaId?: string;
  content: Content;
  isEnabled?: boolean;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
  minEmptyHeight?: number;
  className?: string;
  collisionAxis?: DragAxis;
  config: Config;
  // path: PathSegment[];
};
