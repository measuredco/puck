import { RefObject, useEffect, useState } from "react";
import { useZoneStore } from "./context";

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
  const draggedItem = useZoneStore((s) =>
    s.draggedItem?.data.zone === zoneCompound ? s.draggedItem : null
  );
  const isZone = useZoneStore((s) => s.draggedItem?.data.zone === zoneCompound);
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
