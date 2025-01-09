import { DragDropProvider } from "@dnd-kit/react";
import { PropsWithChildren, ReactNode, useState } from "react";
import { useSortableSafe } from "../../lib/dnd/dnd-kit/safe";

export const SortableProvider = ({
  children,
  onMove,
}: PropsWithChildren<{
  onMove: (moveData: { source: number; target: number }) => void;
}>) => {
  const [move, setMove] = useState({ source: -1, target: -1 });

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const { operation } = event;

        if (operation.source && operation.target) {
          const newMove = {
            source: operation.source.data.index,
            target: operation.target.data.index,
          };

          if (newMove.source !== newMove.target) {
            setMove({
              source: operation.source.data.index,
              target: operation.target.data.index,
            });
          }
        }
      }}
      onDragEnd={() => {
        if (move.source !== -1 && move.target !== -1) {
          onMove(move);
        }
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
  });

  return children({ status, ref: sortableRef });
};
