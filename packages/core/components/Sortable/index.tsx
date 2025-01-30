import { DragDropProvider } from "@dnd-kit/react";
import { PropsWithChildren, ReactNode, useState } from "react";
import { useSortableSafe } from "../../lib/dnd/dnd-kit/safe";
import { useSensors } from "../../lib/dnd/use-sensors";
import {
  CollisionMap,
  createDynamicCollisionDetector,
} from "../../lib/dnd/collision/dynamic";
import { RestrictToElement } from "@dnd-kit/dom/modifiers";

export const SortableProvider = ({
  children,
  onDragStart,
  onDragEnd,
  onMove,
}: PropsWithChildren<{
  onDragStart: () => void;
  onDragEnd: () => void;
  onMove: (moveData: { source: number; target: number }) => void;
}>) => {
  const [move, setMove] = useState({ source: -1, target: -1 });

  const sensors = useSensors();

  return (
    <DragDropProvider
      sensors={sensors}
      modifiers={[
        RestrictToElement.configure({
          element() {
            return document.querySelector("[data-dnd-container]");
          },
        }),
      ]}
      onDragStart={onDragStart}
      onDragOver={(event, manager) => {
        const { operation } = event;
        const { source, target } = operation;

        if (!source || !target) return;

        let sourceIndex = source.data.index;
        let targetIndex = target.data.index;

        const collisionData = (
          manager.dragOperation.data?.collisionMap as CollisionMap
        )?.[target.id];

        if (sourceIndex !== targetIndex && source.id !== target.id) {
          const collisionPosition =
            collisionData?.direction === "up" ? "before" : "after";

          if (targetIndex >= sourceIndex) {
            targetIndex = targetIndex - 1;
          }

          if (collisionPosition === "after") {
            targetIndex = targetIndex + 1;
          }

          setMove({
            source: sourceIndex,
            target: targetIndex,
          });
        }
      }}
      onDragEnd={() => {
        setTimeout(() => {
          if (move.source !== -1 && move.target !== -1) {
            // Delay until animation finished
            // TODO use this in onDragOver instead of optimistic rendering once re-renders reduced to polish out edge cases
            onMove(move);
          }

          onDragEnd();
        }, 250);

        setMove({ source: -1, target: -1 });
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
  }) => ReactNode;
  type?: string;
}) => {
  const { ref: sortableRef, status } = useSortableSafe({
    id,
    type,
    index,
    disabled,
    data: { index },
    collisionDetector: createDynamicCollisionDetector("y"),
  });

  return children({ status, ref: sortableRef });
};
