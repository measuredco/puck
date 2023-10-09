import { ReactNode } from "react";
import { Draggable as DndDraggable } from "react-beautiful-dnd";

export const Draggable = ({
  children,
  id,
  index,
  showShadow,
  disableAnimations = false,
}: {
  children: ReactNode;
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
            {children}
          </div>
          {/* See https://github.com/atlassian/react-beautiful-dnd/issues/216#issuecomment-906890987 */}
          {showShadow && snapshot.isDragging && (
            <div style={{ transform: "none !important" }}>{children}</div>
          )}
        </>
      )}
    </DndDraggable>
  );
};
