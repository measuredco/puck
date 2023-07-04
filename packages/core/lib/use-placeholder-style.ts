import { CSSProperties, useState } from "react";

export const usePlaceholderStyle = () => {
  const queryAttr = "data-rbd-drag-handle-draggable-id";

  const [placeholderStyle, setPlaceholderStyle] = useState<CSSProperties>();

  const onDragUpdate = (update) => {
    if (!update.destination) {
      return;
    }
    const draggableId = update.draggableId;
    const destinationIndex = update.destination.index;

    const domQuery = `[${queryAttr}='${draggableId}']`;
    const draggedDOM = document.querySelector(domQuery);

    if (!draggedDOM) {
      return;
    }

    const targetListElement = document.querySelector("#puck-drop-zone");

    const { clientHeight } = draggedDOM;

    if (!targetListElement) {
      return;
    }

    let clientY = 0;

    if (destinationIndex > 0) {
      const children = Array.from(targetListElement.children)
        .filter((item) => item !== draggedDOM)
        .slice(0, destinationIndex);

      clientY = children.reduce(
        (total, item) =>
          total +
          item.clientHeight +
          parseInt(window.getComputedStyle(item).marginTop.replace("px", "")) +
          parseInt(
            window.getComputedStyle(item).marginBottom.replace("px", "")
          ),

        0
      );
    }

    setPlaceholderStyle({
      position: "absolute",
      top: clientY,
      left: 0,
      height: clientHeight,
      width: "100%",
    });
  };

  return { onDragUpdate, placeholderStyle };
};
