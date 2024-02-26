import { CSSProperties, useState } from "react";
import { DragStart, DragUpdate } from "@measured/dnd";

export const usePlaceholderStyle = () => {
  const queryAttr = "data-rfd-drag-handle-draggable-id";

  const [placeholderStyle, setPlaceholderStyle] = useState<CSSProperties>();

  const onDragStartOrUpdate = (
    draggedItem: DragStart & Partial<DragUpdate>
  ) => {
    const draggableId = draggedItem.draggableId;
    const destinationIndex = (draggedItem.destination || draggedItem.source)
      .index;
    const droppableId = (draggedItem.destination || draggedItem.source)
      .droppableId;

    const domQuery = `[${queryAttr}='${draggableId}']`;

    const iframe = document.querySelector(
      `#preview-iframe`
    ) as HTMLIFrameElement;

    const draggedDOM =
      document.querySelector(domQuery) ||
      iframe.contentWindow?.document.querySelector(domQuery);

    if (!draggedDOM) {
      return;
    }

    const targetListElement = iframe.contentWindow?.document.querySelector(
      `[data-rfd-droppable-id='${droppableId}']`
    );

    const { clientHeight } = draggedDOM;

    if (!targetListElement) {
      return;
    }

    let clientY = 0;

    const isSameDroppable =
      draggedItem.source.droppableId === draggedItem.destination?.droppableId;

    if (destinationIndex > 0) {
      const end =
        destinationIndex > draggedItem.source.index && isSameDroppable
          ? destinationIndex + 1
          : destinationIndex;

      const children = Array.from(targetListElement.children)
        .filter(
          (item) =>
            item !== draggedDOM &&
            item.getAttributeNames().indexOf("data-puck-placeholder") === -1 &&
            item
              .getAttributeNames()
              .indexOf("data-rfd-placeholder-context-id") === -1
        )
        .slice(0, end);

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

  return { onDragStartOrUpdate, placeholderStyle };
};
