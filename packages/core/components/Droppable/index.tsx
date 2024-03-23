import {
  Droppable as DndDroppable,
  DroppableProps,
  DroppableProvided,
  DroppableStateSnapshot,
} from "@measured/dnd";
import { useAppContext } from "../Puck/context";

const defaultProvided: DroppableProvided = {
  droppableProps: {
    "data-rfd-droppable-context-id": "",
    "data-rfd-droppable-id": "",
  },
  placeholder: null,
  innerRef: () => null,
};

const defaultSnapshot: DroppableStateSnapshot = {
  isDraggingOver: false,
  draggingOverWith: null,
  draggingFromThisWith: null,
  isUsingPlaceholder: false,
};

const DefaultDroppable = ({ children }: DroppableProps) => (
  <>{children(defaultProvided, defaultSnapshot)}</>
);

export const Droppable = (props: DroppableProps) => {
  const { status } = useAppContext();

  const El = status !== "LOADING" ? DndDroppable : DefaultDroppable;

  return <El {...props} />;
};
