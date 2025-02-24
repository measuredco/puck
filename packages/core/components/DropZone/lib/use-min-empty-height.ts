import { RefObject, useEffect, useState } from "react";
import { ZoneStoreContext } from "./../context";
import { useContextStore } from "../../../lib/use-context-store";
import { useNodeStore } from "../../../stores/node-store";

export const useMinEmptyHeight = ({
  zoneCompound,
  userMinEmptyHeight,
  ref,
}: {
  zoneCompound: string;
  userMinEmptyHeight: number;
  ref: RefObject<HTMLDivElement | null>;
}) => {
  const [prevHeight, setPrevHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { draggedItem, isZone } = useContextStore(ZoneStoreContext, (s) => {
    return {
      draggedItem:
        s.draggedItem?.data.zone === zoneCompound ? s.draggedItem : null,
      isZone: s.draggedItem?.data.zone === zoneCompound,
    };
  });

  useEffect(() => {
    if (draggedItem && ref.current) {
      if (isZone) {
        const rect = ref.current.getBoundingClientRect();

        setPrevHeight(rect.height);
        setIsAnimating(true);

        return;
      }
    }

    setPrevHeight(0);
    setTimeout(() => {
      const { nodes } = useNodeStore.getState();

      Object.entries(nodes).forEach(([_, node]) => {
        node?.methods.sync();
      });

      setIsAnimating(false);
    }, 400);
  }, [ref.current, draggedItem, zoneCompound]);

  return [prevHeight || userMinEmptyHeight, isAnimating];
};
