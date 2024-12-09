import { Point } from "@dnd-kit/geometry";
import { getDirection } from "./get-direction";
import { Direction, DragAxis } from "../../../../types";

type Interval = {
  current: Point;
  delta: Point;
  previous: Point;
  direction: Direction;
};

const INTERVAL_SENSITIVITY = 10;

const intervalCache: Interval = {
  current: { x: 0, y: 0 },
  delta: { x: 0, y: 0 },
  previous: { x: 0, y: 0 },
  direction: null,
};

/**
 * A method for tracking and getting the current movement interval, including:
 *
 * - `current` - the current point to track
 * - `previous` - the previous point, captured when the delta is greater than the INTERVAL_SENSITIVITY
 * - `delta` - the delta between the two points
 * - `direction` - the direction of travel of the delta, locked to an axis
 *
 * @param point The latest point to track.
 * @param dragAxis The axis to lock the direction to. If the value is "dynamic", it can be either axis based on the greater value.
 *
 * @returns Current movement interval
 */
export const trackMovementInterval = (
  point: Point,
  dragAxis: DragAxis = "dynamic"
) => {
  intervalCache.current = point;

  intervalCache.delta = {
    x: point.x - intervalCache.previous.x,
    y: point.y - intervalCache.previous.y,
  };

  intervalCache.direction =
    getDirection(dragAxis, intervalCache.delta) || intervalCache.direction;

  if (
    Math.abs(intervalCache.delta.x) > INTERVAL_SENSITIVITY ||
    Math.abs(intervalCache.delta.y) > INTERVAL_SENSITIVITY
  ) {
    intervalCache.previous = Point.from(point);
  }

  return intervalCache;
};
