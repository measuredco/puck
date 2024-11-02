import {
  Collision,
  CollisionDetector,
  CollisionPriority,
  CollisionType,
} from "@dnd-kit/abstract";
import { directionalCollision } from "../directional";
import { DragAxis } from "./get-direction";
import { getMidpointImpact } from "./get-midpoint-impact";
import { trackMovementInterval } from "./track-movement-interval";
import { collisionDebug } from "../collision-debug";

export type Direction = "left" | "right" | "up" | "down" | null;

/**
 * A factory for creating a "dynamic" collision detector
 *
 * A dynamic collision combines mid-point and directional collisions for smooth, flicker-free dragging with complex
 * layouts.
 *
 * Midpoint-based detection creates a natural snapping effect, inspired by react-beautiful-dnd. Each collision is
 * provided with the direction of movement, so the user can determine the appropriate place to inject the item based
 * on their layout or document direction.
 *
 * If a draggable is being dragged towards a droppable with the same ID, this is deemed the highest priority collision
 * to prevent flickering with complex layout shifts during drag.
 *
 * @param dragAxis Restrict mid-point detection to a given axis, providing a traditional sortable list detection.
 * @param midpointOffset A percentage offset from the midpoint. Defaults to 5% (0.05) from the mid-point in the
 * direction of travel, helping to create "dead zone" in the center of the item.
 *
 * @returns
 */
export const createDynamicCollisionDetector = (
  dragAxis: DragAxis,
  midpointOffset: number = 0.05
) =>
  ((input) => {
    const { dragOperation, droppable } = input;

    const { position } = dragOperation;
    const dragShape = dragOperation.shape?.current;
    const { shape: dropShape } = droppable;

    if (!dragShape || !dropShape) {
      return null;
    }

    const { center: dragCenter } = dragShape;

    const interval = trackMovementInterval(position.current, dragAxis);

    dragOperation.data = {
      ...dragOperation.data,
      direction: interval.direction,
    };

    const { center: dropCenter } = dropShape;

    const overMidpoint = getMidpointImpact(
      dragShape,
      dropShape,
      interval.direction,
      midpointOffset
    );

    if (dragOperation.source?.id === droppable.id) {
      // If the droppable and draggable are the same item, we check if we're moving towards the droppable.
      // If we are, we always return that as the highest priority collision target to prevent unexpected
      // movement in complex grid layouts

      const collision = directionalCollision(input, interval.previous);

      collisionDebug(dragCenter, dropCenter, droppable.id.toString(), "yellow");

      if (collision) {
        return {
          ...collision,
          priority: CollisionPriority.Highest,
        };
      }
    }

    const intersectionArea = dragShape.intersectionArea(dropShape);
    const intersectionRatio = intersectionArea / dropShape.area;

    if (intersectionArea && overMidpoint) {
      collisionDebug(dragCenter, dropCenter, droppable.id.toString(), "green");

      const collision: Collision = {
        id: `${droppable.id}`,
        value: intersectionRatio,
        priority: CollisionPriority.Normal,
        type: CollisionType.Collision,
      };

      return collision;
    }

    collisionDebug(dragCenter, dropCenter, droppable.id.toString(), "hotpink");

    return null;
  }) as CollisionDetector;
