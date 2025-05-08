import { DragDropProvider } from "@dnd-kit/react";
import { PropsWithChildren, ReactNode, useState } from "react";
import { useSortableSafe } from "../../lib/dnd/dnd-kit/safe";
import { useSensors } from "../../lib/dnd/use-sensors";
import {
  CollisionMap,
  createDynamicCollisionDetector,
} from "../../lib/dnd/collision/dynamic";
import "./styles.css";

export const SortableProvider = ({
  children,
  onDragStart,
  onDragEnd,
  onMove,
}: PropsWithChildren<{
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onMove: (moveData: { source: number; target: number }) => void;
}>) => {
  const sensors = useSensors({
    mouse: { distance: { value: 5 } },
  });

  return (
    <DragDropProvider
      sensors={sensors}
      onDragStart={(event) =>
        onDragStart(event.operation.source?.id.toString() ?? "")
      }
      onDragOver={(event, manager) => {
        event.preventDefault();

        const { operation } = event;
        const { source, target } = operation;

        if (!source || !target) return;

        let sourceIndex = source.data.index;
        let targetIndex = target.data.index;

        // NB drag operation can come out of sync with collision
        // Would be better for event itself to contain collision data
        const collisionData = (
          manager.dragOperation.data?.collisionMap as CollisionMap
        )?.[target.id];

        if (sourceIndex !== targetIndex && source.id !== target.id) {
          const collisionPosition =
            collisionData.direction === "up" ? "before" : "after";

          if (targetIndex >= sourceIndex) {
            targetIndex = targetIndex - 1;
          }

          if (collisionPosition === "after") {
            targetIndex = targetIndex + 1;
          }

          onMove({
            source: sourceIndex,
            target: targetIndex,
          });
        }
      }}
      onDragEnd={() => {
        setTimeout(() => {
          // Delay until animation finished
          onDragEnd();
        }, 250);
      }}
    >
      {children}
    </DragDropProvider>
  );
};

export const Sortable = ({
  id,
  index,
  disabled,
  children,
  type = "item",
}: {
  id: string;
  index: number;
  disabled?: boolean;
  children: (props: {
    status: "idle" | "dragging" | "dropping";
    ref: (element: Element | null) => void;
    handleRef: (element: Element | null) => void;
  }) => ReactNode;
  type?: string;
}) => {
  const {
    ref: sortableRef,
    status,
    handleRef,
  } = useSortableSafe({
    id,
    type,
    index,
    disabled,
    data: { index },
    collisionDetector: createDynamicCollisionDetector("y"),
  });

  return children({ status, ref: sortableRef, handleRef });
};
