import { RefObject, useEffect, useState } from "react";
import { ZoneStoreContext } from "./../context";
import { useContextStore } from "../../../lib/use-context-store";
import { useAppStoreApi } from "../../../store";
import { useOnDragFinished } from "../../../lib/dnd/use-on-drag-finished";

export const useMinEmptyHeight = ({
  zoneCompound,
  userMinEmptyHeight,
  ref,
}: {
  zoneCompound: string;
  userMinEmptyHeight: number;
  ref: RefObject<HTMLDivElement | null>;
}) => {
  const appStore = useAppStoreApi();
  const [prevHeight, setPrevHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { draggedItem, isZone } = useContextStore(ZoneStoreContext, (s) => {
    return {
      draggedItem:
        s.draggedItem?.data.zone === zoneCompound ? s.draggedItem : null,
      isZone: s.draggedItem?.data.zone === zoneCompound,
    };
  });

  // TODO animation is now broken
  const onDragFinished = useOnDragFinished(
    (finished) => {
      if (finished) {
        setTimeout(() => {
          const _prevHeight = prevHeight;

          const newHeight = ref.current?.getBoundingClientRect().height;

          if (newHeight === _prevHeight) return;

          const zones = appStore.getState().state.indexes.zones;
          const nodes = appStore.getState().nodes;
          const selectedItem = appStore.getState().selectedItem;

          const contentIds = zones[zoneCompound]?.contentIds || [];

          contentIds.forEach((contentId) => {
            const node = nodes.nodes[contentId];
            node?.methods.sync();
          });

          if (selectedItem) {
            nodes.nodes[selectedItem.props.id]?.methods.sync();
          }

          setIsAnimating(false);
        }, 200);
      }
    },
    [appStore, prevHeight, zoneCompound]
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

    return onDragFinished();
  }, [ref.current, draggedItem, onDragFinished]);

  return [prevHeight || userMinEmptyHeight, isAnimating];
};
