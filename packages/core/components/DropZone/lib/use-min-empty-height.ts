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

  const onDragFinished = useOnDragFinished(
    (finished) => {
      if (finished) {
        const newHeight = ref.current?.getBoundingClientRect().height;

        setPrevHeight(0);

        if (prevHeight === newHeight) {
          setIsAnimating(false);

          return;
        }

        const selectedItem = appStore.getState().selectedItem;
        const zones = appStore.getState().state.indexes.zones;
        const nodes = appStore.getState().nodes;

        nodes.nodes[selectedItem?.props.id]?.methods.hideOverlay();

        setTimeout(() => {
          const contentIds = zones[zoneCompound]?.contentIds || [];

          contentIds.forEach((contentId) => {
            const node = nodes.nodes[contentId];
            node?.methods.sync();
          });

          if (selectedItem) {
            setTimeout(() => {
              nodes.nodes[selectedItem.props.id]?.methods.sync();
              nodes.nodes[selectedItem.props.id]?.methods.showOverlay();
            }, 200);
          }

          setIsAnimating(false);
        }, 50);
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

    return onDragFinished();
  }, [ref.current, draggedItem, onDragFinished]);

  return [prevHeight || userMinEmptyHeight, isAnimating];
};
