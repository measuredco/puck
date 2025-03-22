import { CSSProperties } from "react";
import { Content, DragAxis } from "../../types";

export type DropZoneProps = {
  zone?: string;
  content?: Content;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
  minEmptyHeight?: number;
  className?: string;
  collisionAxis?: DragAxis;
};
