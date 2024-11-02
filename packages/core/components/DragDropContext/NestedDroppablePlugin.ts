import { DragDropManager } from "@dnd-kit/dom";
import { Plugin } from "@dnd-kit/abstract";

import type { Droppable } from "@dnd-kit/dom";

import { effects } from "../../../../../dnd-kit/packages/state/dist";
import { BoundingRectangle } from "@dnd-kit/geometry";
import { throttle } from "../../lib/throttle";

interface Position {
  x: number;
  y: number;
}

function isPositionInsideRect(
  position: Position,
  rect: BoundingRectangle
): boolean {
  return (
    position.x >= rect.left &&
    position.x <= rect.right &&
    position.y >= rect.top &&
    position.y <= rect.bottom
  );
}

type NestedDroppablePluginOptions = {
  onChange: (params: {
    deepestAreaId: string | null;
    deepestZoneId: string | null;
  }) => void;
};

// Something is going wrong with tearing down the classes.
// This is an awful hack to prevent the plugin from running more than once.
let globallyRegistered = false;

// Pixels to buffer sortable items by, helping when
// 2 items are butted up against each-other
const BUFFER_ZONE = 8;

// Force shapes to refresh on mouse move.
// TODO Expensive - can I remove this? Or restrict to during drag only?
const REFRESH_ON_MOVE = true;

const depthSort = (candidates: Droppable[]) => {
  return candidates.sort((a, b) => {
    // Use depth instead of ref, as this is 1) faster and 2) handles cases where a and b share a ref
    if (a.data.depth > b.data.depth) {
      return 1;
    }

    if (b.data.depth > a.data.depth) {
      return -1;
    }

    return 0;
  });
};

const getZoneId = (candidate: Droppable | undefined) => {
  let id: string | null = candidate?.id as string;

  if (!candidate) return null;

  if (!candidate.data.zone) {
    if (candidate.data.containsActiveZone) {
      id = null;
    } else {
      id = candidate.data.group;
    }
  }

  return id;
};

const getAreaId = (candidate: Droppable) => {
  if (candidate.data.containsActiveZone) {
    return candidate.id as string;
  }

  return null;
};

const getDeepestId = (
  candidates: Droppable[],
  idFn: (candidate: Droppable) => string | null
) => {
  let id: string | null = null;

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];

    id = idFn(candidate);

    if (id) break;
  }

  return id;
};

const expandHitBox = (rect: BoundingRectangle): BoundingRectangle => {
  return {
    bottom: rect.bottom + BUFFER_ZONE,
    top: rect.top - BUFFER_ZONE,
    width: rect.width + BUFFER_ZONE * 2,
    height: rect.height + BUFFER_ZONE * 2,
    left: rect.left - BUFFER_ZONE,
    right: rect.right + BUFFER_ZONE,
  };
};

export const createNestedDroppablePlugin = ({
  onChange,
}: NestedDroppablePluginOptions) =>
  class NestedDroppablePlugin extends Plugin<DragDropManager, {}> {
    constructor(manager: DragDropManager, options?: {}) {
      super(manager);

      const cleanupEffect = effects(() => {
        const getPointerCollisions = (position: Position) => {
          const candidates: Droppable[] = [];
          for (const droppable of manager.registry.droppables.value) {
            if (droppable.shape) {
              let rect = droppable.shape.boundingRectangle;

              const isNotSourceZone =
                droppable.id !==
                (manager.dragOperation.source?.data.group ||
                  manager.dragOperation.source?.id);

              const isNotTargetZone =
                droppable.id !==
                (manager.dragOperation.source?.data.group ||
                  manager.dragOperation.source?.id);

              // Expand hitboxes on zones
              if (droppable.data.zone && isNotSourceZone && isNotTargetZone) {
                rect = expandHitBox(rect);
              }

              if (isPositionInsideRect(position, rect)) {
                candidates.push(droppable);
              }
            }
          }

          return candidates;
        };

        const handleMove = (position: Position) => {
          if (REFRESH_ON_MOVE) {
            for (const droppable of manager.registry.droppables.value) {
              droppable.refreshShape();
            }
          }

          const candidates = getPointerCollisions(position);

          if (candidates.length > 0) {
            const sortedCandidates = depthSort(candidates);

            const draggable = manager.dragOperation.source;

            const draggedCandidateIndex = sortedCandidates.findIndex(
              (candidate) => candidate.id === draggable?.id
            );

            const draggedCandidateId = draggable?.id;

            let filteredCandidates = [...sortedCandidates];

            if (draggedCandidateId && draggedCandidateIndex > -1) {
              // Removed dragged candidate
              filteredCandidates.splice(draggedCandidateIndex, 1);
            }

            // Remove any descendants
            filteredCandidates = filteredCandidates.filter((candidate) => {
              if (draggedCandidateId && draggedCandidateIndex > -1) {
                if (candidate.data.path.indexOf(draggedCandidateId) > -1) {
                  return false;
                }
              }

              // Remove non-droppable zones
              if (candidate.data.zone && !candidate.data.isDroppableTarget) {
                return false;
              }

              // Remove items in non-droppable zones
              if (!candidate.data.zone && !candidate.data.inDroppableZone) {
                return false;
              }

              return true;
            });

            filteredCandidates.reverse();

            const deepestZoneId = getZoneId(filteredCandidates[0]);
            const deepestAreaId = getDeepestId(filteredCandidates, getAreaId);

            onChange({ deepestZoneId, deepestAreaId });
          }
        };

        const handleMoveThrottled = throttle(handleMove, 50);

        const handlePointerMove = (event: PointerEvent) => {
          handleMoveThrottled({
            x: event.clientX,
            y: event.clientY,
          });
        };

        // For some reason, this is getting instantiated multiple times. Hack to avoid it.
        if (globallyRegistered) {
          return;
        }

        document.body.addEventListener("pointermove", handlePointerMove);

        globallyRegistered = true;

        this.destroy = () => {
          globallyRegistered = false;
          document.body.removeEventListener("pointermove", handlePointerMove);
          cleanupEffect();
        };
      });
    }
  };
