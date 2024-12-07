import { DragDropManager } from "@dnd-kit/dom";
import { Plugin } from "@dnd-kit/abstract";

import type { Droppable } from "@dnd-kit/dom";

import { effects } from "@dnd-kit/state";
import { BoundingRectangle } from "@dnd-kit/geometry";
import { throttle } from "../../lib/throttle";
import { ComponentDndData } from "../DraggableComponent";
import { DropZoneDndData } from "../DropZone";

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
  onChange: (
    params: {
      area: string | null;
      zone: string | null;
    },
    manager: DragDropManager
  ) => void;
};

// Pixels to buffer sortable items by, helping when
// 2 items are butted up against each-other
const BUFFER_ZONE = 8;

// Force shapes to refresh on mouse move.
// TODO This is likely expensive. Explore ways to remove this.
const REFRESH_ON_MOVE = true;

const depthSort = (candidates: Droppable[]) => {
  return candidates.sort((a, b) => {
    const aData = a.data as ComponentDndData | DropZoneDndData;
    const bData = b.data as ComponentDndData | DropZoneDndData;

    // Use depth instead of ref, as this is 1) faster and 2) handles cases where a and b share a ref
    if (aData.depth > bData.depth) {
      return 1;
    }

    if (bData.depth > aData.depth) {
      return -1;
    }

    return 0;
  });
};

const getZoneId = (candidate: Droppable | undefined) => {
  let id: string | null = candidate?.id as string;

  if (!candidate) return null;

  if (candidate.type === "component") {
    const data = candidate.data as ComponentDndData;

    if (data.containsActiveZone) {
      id = null;
    } else {
      id = data.zone;
    }
  } else if (candidate.type === "void") {
    return "void";
  }

  return id;
};

const getAreaId = (candidate: Droppable) => {
  if (candidate.type === "component") {
    const data = candidate.data as ComponentDndData;

    if (data.containsActiveZone) {
      return candidate.id as string;
    }
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

const getPointerCollisions = (position: Position, manager: DragDropManager) => {
  const candidates: Droppable[] = [];

  const source = manager.dragOperation?.source;
  const sourceData = source ? (source.data as ComponentDndData) : undefined;

  for (const droppable of manager.registry.droppables.value) {
    if (droppable.shape) {
      let rect = droppable.shape.boundingRectangle;

      const isNotSourceZone = droppable.id !== (sourceData?.zone || source?.id);
      const isNotTargetZone = droppable.id !== (sourceData?.zone || source?.id);

      // Expand hitboxes on dropzones
      if (droppable.type === "dropzone" && isNotSourceZone && isNotTargetZone) {
        rect = expandHitBox(rect);
      }

      if (isPositionInsideRect(position, rect)) {
        candidates.push(droppable);
      }
    }
  }

  return candidates;
};

export const findDeepestCandidate = (
  position: Position,
  manager: DragDropManager
) => {
  const candidates = getPointerCollisions(position, manager);

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
      const candidateData = candidate.data as
        | ComponentDndData
        | DropZoneDndData;

      if (draggedCandidateId && draggedCandidateIndex > -1) {
        if (candidateData.path.indexOf(draggedCandidateId) > -1) {
          return false;
        }
      }

      if (candidate.type === "dropzone") {
        const candidateData = candidate.data as DropZoneDndData;

        // Remove non-droppable zones
        if (!candidateData.isDroppableTarget) {
          return false;
        }

        // Remove if dragged item is area
        if (candidateData.areaId === draggedCandidateId) {
          return false;
        }
      }

      return true;
    });

    filteredCandidates.reverse();

    const zone = getZoneId(filteredCandidates[0]);
    const area = getDeepestId(filteredCandidates, getAreaId);

    return { zone, area };
  }
  return {
    zone: "default-zone",
    area: null,
  };
};

export const createNestedDroppablePlugin = ({
  onChange,
}: NestedDroppablePluginOptions) =>
  class NestedDroppablePlugin extends Plugin<DragDropManager, {}> {
    constructor(manager: DragDropManager, options?: {}) {
      super(manager);

      if (typeof window === "undefined") {
        return;
      }

      const cleanupEffect = effects(() => {
        const handleMove = (position: Position) => {
          if (REFRESH_ON_MOVE) {
            for (const droppable of manager.registry.droppables.value) {
              droppable.refreshShape();
            }
          }

          onChange(findDeepestCandidate(position, manager), manager);
        };

        const handleMoveThrottled = throttle(handleMove, 50);

        const handlePointerMove = (event: PointerEvent) => {
          handleMoveThrottled({
            x: event.clientX,
            y: event.clientY,
          });
        };

        document.body.addEventListener("pointermove", handlePointerMove, {
          capture: true, // dndkit's PointerSensor prevents propagation during drag
        });

        this.destroy = () => {
          document.body.removeEventListener("pointermove", handlePointerMove, {
            capture: true,
          });
          cleanupEffect();
        };
      });
    }
  };
