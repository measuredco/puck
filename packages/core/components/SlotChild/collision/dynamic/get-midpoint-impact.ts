import { Shape } from "@dnd-kit/geometry";
import { Direction } from "../../../../types";

/**
 * Determine whether or not the leading edge of the dragShape (the edge that is on
 * the side of the direction of travel) is over the midpoint of the dropShape.
 *
 * @param dragShape The shape of the draggable
 * @param dropShape The shape of the droppable
 * @param direction The direction of travel
 * @param offsetMultiplier An optional offset multiplier
 *
 * @returns A boolean describingw hether or not the leadingEdge of the dragShape is over the mid-point of the dropShape
 */
export const getMidpointImpact = (
  dragShape: Shape,
  dropShape: Shape,
  direction: Direction,
  offsetMultiplier: number = 0
): Boolean => {
  const dragRect = dragShape.boundingRectangle;
  const dropCenter = dropShape.center;

  if (direction === "down") {
    const offset = offsetMultiplier * dropShape.boundingRectangle.height;
    return dragRect.bottom >= dropCenter.y + offset;
  } else if (direction === "up") {
    const offset = offsetMultiplier * dropShape.boundingRectangle.height;
    return dragRect.top < dropCenter.y - offset;
  } else if (direction === "left") {
    const offset = offsetMultiplier * dropShape.boundingRectangle.width;
    return dropCenter.x - offset >= dragRect.left;
  }

  // direction === "right"
  const offset = offsetMultiplier * dropShape.boundingRectangle.width;
  return dragRect.right - offset >= dropCenter.x;
};
