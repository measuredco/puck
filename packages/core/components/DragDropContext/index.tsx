import {
  DragDropContext as DndDragDropContext,
  DragDropContextProps,
} from "@measured/dnd";
import { useAppContext } from "../Puck/context";

const DefaultDragDropContext = ({ children }: DragDropContextProps) => (
  <>{children}</>
);

export const DragDropContext = (props: DragDropContextProps) => {
  const { status } = useAppContext();

  const El = status !== "LOADING" ? DndDragDropContext : DefaultDragDropContext;

  return <El {...props} />;
};
