import { CSSProperties } from "react";

export type DropZoneProps = {
  zone: string;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
  className?: string;
  dragRef?: ((element: Element | null) => void) | null;
};
