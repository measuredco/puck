import { RefObject, useEffect, useState } from "react";
import { ComponentDndData } from "../DraggableComponent";
import { Draggable } from "@dnd-kit/abstract";

export const useMinEmptyHeight = ({
  draggedItem,
  zoneCompound,
  userMinEmptyHeight,
  ref,
}: {
  draggedItem: Draggable<any> | null | undefined;
  zoneCompound: string;
  userMinEmptyHeight: number;
  ref: RefObject<HTMLDivElement | null>;
}) => {
  const [prevHeight, setPrevHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (draggedItem && ref.current) {
      const componentData = draggedItem.data as ComponentDndData;

      if (componentData.zone === zoneCompound) {
        const rect = ref.current.getBoundingClientRect();

        setPrevHeight(rect.height);
        setIsAnimating(true);

        return;
      }
    }

    setPrevHeight(0);
    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  }, [ref.current, draggedItem, zoneCompound]);

  return [prevHeight || userMinEmptyHeight, isAnimating];
};
