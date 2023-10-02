import { CSSProperties, useState } from "react";
import { DragStart, DragUpdate } from "react-beautiful-dnd";
import { calculateY } from "./calculate-y";

export const usePlaceholderStyle = () => {
  const [placeholderStyle, setPlaceholderStyle] = useState<CSSProperties>();

  const onDragStartOrUpdate = (
    draggedItem: DragStart & Partial<DragUpdate>
  ) => {
    const dimensions = calculateY(draggedItem);

    if (!dimensions) return;

    setPlaceholderStyle({
      position: "absolute",
      top: dimensions.y,
      left: 0,
      height: dimensions.height,
      width: "100%",
    });
  };

  return { onDragStartOrUpdate, placeholderStyle };
};
