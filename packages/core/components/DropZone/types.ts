import { CSSProperties, ElementType } from "react";
import { DragAxis } from "../../types";

export type DropZoneProps<T extends ElementType = "div"> = {
  zone: string;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
  minEmptyHeight?: number;
  className?: string;
  collisionAxis?: DragAxis;
  as?: T;
};
