import { CSSProperties, useState } from "react";

export const usePlaceholderStyle = () => {
  const queryAttr = "data-rbd-drag-handle-draggable-id";

  const [placeholderStyle, setPlaceholderStyle] = useState<CSSProperties>();

  const onDragUpdate = (update) => {
    if (!update.destination) {
      return;
    }
    const draggableId = update.draggableId;
    const sourceIndex = update.source.index;
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

    const up = destinationIndex > sourceIndex;
    const sameList =
      update.source.droppableId === update.destination.droppableId;

    let clientY = 0;

    if (destinationIndex > 0) {
      const itemAtIndex =
        targetListElement.children[
          up && sameList ? destinationIndex : destinationIndex - 1
        ];

      const el = itemAtIndex as HTMLElement;
      const style = window.getComputedStyle(itemAtIndex);
      const marginBottom = parseFloat(style.marginBottom);
      clientY = el.offsetTop + itemAtIndex.clientHeight + marginBottom;
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
