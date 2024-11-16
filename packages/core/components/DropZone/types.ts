import { CSSProperties } from "react";
import { DragAxis } from "../../types";

export type DropZoneProps = {
  zone: string;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
  className?: string;
  dragRef?: ((element: Element | null) => void) | null;
  collisionAxis?: DragAxis;
};
