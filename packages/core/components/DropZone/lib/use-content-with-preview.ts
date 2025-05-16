import { Preview } from "./../context";
import { useContext, useEffect, useState } from "react";
import { useRenderedCallback } from "../../../lib/dnd/use-rendered-callback";
import { insert } from "../../../lib/data/insert";
import { ZoneStoreContext } from "../context";
import { useContextStore } from "../../../lib/use-context-store";
import { useAppStore } from "../../../store";

export const useContentIdsWithPreview = (
  contentIds: string[],
  zoneCompound: string
): [string[], Preview | undefined] => {
  const zoneStore = useContext(ZoneStoreContext);
  const preview = useContextStore(
    ZoneStoreContext,
    (s) => s.previewIndex[zoneCompound]
  );

  const isDragging = useAppStore((s) => s.state.ui.isDragging);

  const [contentIdsWithPreview, setContentIdsWithPreview] =
    useState(contentIds);
  const [localPreview, setLocalPreview] = useState<Preview | undefined>(
    preview
  );

  const updateContent = useRenderedCallback(
    (contentIds: string[], preview: Preview | undefined) => {
      const s = zoneStore.getState();
      const draggedItemId = s.draggedItem?.id;

      if (preview) {
        if (preview.type === "insert") {
          setContentIdsWithPreview(
            insert(
              contentIds.filter((id) => id !== preview.props.id),
              preview.index,
              preview.props.id
            )
          );
        } else {
          setContentIdsWithPreview(
            insert(
              contentIds.filter((id) => id !== preview.props.id),
              preview.index,
              preview.props.id
            )
          );
        }
      } else {
        setContentIdsWithPreview(
          contentIds.filter((id) => id !== draggedItemId)
        );
      }

      setLocalPreview(preview);
    },
    []
  );

  useEffect(() => {
    updateContent(contentIds, preview, isDragging);
  }, [contentIds, preview, isDragging]);

  return [contentIdsWithPreview, localPreview];
};
