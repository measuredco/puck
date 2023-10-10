import { ReactNode } from "react";
import {
  Draggable as DndDraggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";

export const Draggable = ({
  className,
  children,
  id,
  index,
  showShadow,
  disableAnimations = false,
}: {
  className?: (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot
  ) => string;
  children: (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot
  ) => ReactNode;
  id: string;
  index: number;
  showShadow?: boolean;
  disableAnimations?: boolean;
}) => {
  return (
    <DndDraggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <>
          <div
            className={className && className(provided, snapshot)}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              transform:
                snapshot.isDragging || !disableAnimations
                  ? provided.draggableProps.style?.transform
                  : "translate(0px, 0px)",
            }}
          >
            {children(provided, snapshot)}
          </div>
          {/* See https://github.com/atlassian/react-beautiful-dnd/issues/216#issuecomment-906890987 */}
          {showShadow && snapshot.isDragging && (
            <div style={{ transform: "none !important" }}>
              {children(provided, snapshot)}
            </div>
          )}
        </>
      )}
    </DndDraggable>
  );
};
