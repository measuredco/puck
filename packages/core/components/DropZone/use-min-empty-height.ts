import { RefObject, useEffect, useState } from "react";
import { useZoneStore } from "./context";
import { useShallow } from "zustand/react/shallow";

export const useMinEmptyHeight = ({
  zoneCompound,
  userMinEmptyHeight,
  ref,
  providerId,
}: {
  zoneCompound: string;
  userMinEmptyHeight: number;
  ref: RefObject<HTMLDivElement | null>;
  providerId: string;
}) => {
  const [prevHeight, setPrevHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { draggedItem, isZone } = useZoneStore(
    useShallow((s) => {
      const providerState = s[providerId];

      return {
        draggedItem:
          providerState?.draggedItem?.data.zone === zoneCompound
            ? providerState.draggedItem
            : null,
        isZone: providerState?.draggedItem?.data.zone === zoneCompound,
      };
    })
  );

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
      setIsAnimating(false);
    }, 400);
  }, [ref.current, draggedItem, zoneCompound]);

  return [prevHeight || userMinEmptyHeight, isAnimating];
};
