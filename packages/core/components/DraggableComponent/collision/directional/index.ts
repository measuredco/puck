import { CollisionType, DragOperation, Droppable } from "@dnd-kit/abstract";
import { Point } from "@dnd-kit/geometry";
import { collisionDebug } from "../collision-debug";

let distanceChange: "increasing" | "decreasing" = "increasing";

/**
 * Collide if we're moving towards an item.
 */
export const directionalCollision = (
  input: { dragOperation: DragOperation; droppable: Droppable },
  previous: Point
) => {
  const { dragOperation, droppable } = input;
  const { shape: dropShape } = droppable;
  const { position } = dragOperation;
  const dragShape = dragOperation.shape?.current;

  if (!dragShape || !dropShape) return null;

  const dropCenter = dropShape.center;

  const distanceToPrevious = Math.sqrt(
    Math.pow(dropCenter.x - previous.x, 2) +
      Math.pow(dropCenter.y - previous.y, 2)
  );

  const distanceToCurrent = Math.sqrt(
    Math.pow(dropCenter.x - position.current.x, 2) +
      Math.pow(dropCenter.y - position.current.y, 2)
  );

  distanceChange =
    distanceToCurrent === distanceToPrevious
      ? distanceChange
      : distanceToCurrent < distanceToPrevious
      ? "decreasing"
      : "increasing";

  collisionDebug(
    dragShape.center,
    dropCenter,
    droppable.id.toString(),
    "rebeccapurple"
  );

  if (distanceChange === "decreasing") {
    return {
      id: droppable.id,
      value: 1,
      type: CollisionType.Collision,
    };
  }

  return null;
};
