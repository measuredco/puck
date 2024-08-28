import { ReactNode } from "react";
import {
  Draggable as DndDraggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggableProps,
  DraggableRubric,
} from "@measured/dnd";
import { useAppContext } from "../Puck/context";

const defaultProvided: DraggableProvided = {
  draggableProps: {
    "data-rfd-draggable-context-id": "",
    "data-rfd-draggable-id": "",
  },
  dragHandleProps: null,
  innerRef: () => null,
};

const defaultSnapshot: DraggableStateSnapshot = {
  isDragging: false,
  isDropAnimating: false,
  isClone: false,
  dropAnimation: null,
  draggingOver: null,
  combineWith: null,
  combineTargetFor: null,
  mode: null,
};

const defaultRubric: DraggableRubric = {
  draggableId: "",
  type: "",
  source: { droppableId: "", index: 0 },
};

export const DefaultDraggable = ({ children }: DraggableProps) => (
  <>{children(defaultProvided, defaultSnapshot, defaultRubric)}</>
);

export const Draggable = ({
  className,
  children,
  id,
  index,
  showShadow,
  disableAnimations = false,
  isDragDisabled = false,
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
  isDragDisabled?: boolean;
}) => {
  const { status } = useAppContext();

  const El = status !== "LOADING" ? DndDraggable : DefaultDraggable;

  return (
    <El draggableId={id} index={index} isDragDisabled={isDragDisabled}>
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
              cursor: isDragDisabled ? "no-drop" : "grab",
            }}
          >
            {children(provided, snapshot)}
          </div>
          {/* See https://github.com/atlassian/react-beautiful-dnd/issues/216#issuecomment-906890987 */}
          {showShadow && snapshot.isDragging && (
            <div
              className={className && className(provided, snapshot)}
              style={{ transform: "none !important" }}
            >
              {children(provided, snapshot)}
            </div>
          )}
        </>
      )}
    </El>
  );
};
