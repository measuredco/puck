import { Point } from "@dnd-kit/geometry";

export type Direction = "left" | "right" | "up" | "down" | null;

export type DragAxis = "dynamic" | "y" | "x";

export const getDirection = (dragAxis: DragAxis, delta: Point): Direction => {
  if (dragAxis === "dynamic") {
    if (Math.abs(delta.y) > Math.abs(delta.x)) {
      return delta.y === 0 ? null : delta.y > 0 ? "down" : "up";
    } else {
      return delta.x === 0 ? null : delta.x > 0 ? "right" : "left";
    }
  } else if (dragAxis === "x") {
    return delta.x === 0 ? null : delta.x > 0 ? "right" : "left";
  }

  return delta.y === 0 ? null : delta.y > 0 ? "down" : "up";
};
