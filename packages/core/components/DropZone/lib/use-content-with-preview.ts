import { Preview } from "./../context";
import { useEffect, useState } from "react";
import { useRenderedCallback } from "../../../lib/dnd/use-rendered-callback";
import { insert } from "../../../lib/insert";
import { ZoneStoreContext } from "../context";
import { useContextStore } from "../../../lib/use-context-store";
import { useAppStore } from "../../../store";

export const useContentIdsWithPreview = (
  contentIds: string[],
  zoneCompound: string
): [string[], Preview | undefined] => {
  const { draggedItemId, preview, previewExists } = useContextStore(
    ZoneStoreContext,
    (s) => {
      return {
        draggedItemId: s.draggedItem?.id,
        preview: s.previewIndex[zoneCompound],
        previewExists: Object.keys(s.previewIndex || {}).length > 0,
      };
    }
  );

  const isDragging = useAppStore((s) => s.state.ui.isDragging);

  const [contentIdsWithPreview, setContentIdsWithPreview] =
    useState(contentIds);
  const [localPreview, setLocalPreview] = useState<Preview | undefined>(
    preview
  );

  const updateContent = useRenderedCallback(
    (
      contentIds: string[],
      preview: Preview | undefined,
      isDragging: boolean
    ) => {
      // Preview is cleared but context hasn't yet caught up
      // This is necessary because Zustand clears the preview before the dispatcher finishes
      // Refactor this once all state has moved to Zustand.
      if (isDragging && !previewExists) {
        return;
      }

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
          previewExists
            ? contentIds.filter((id) => id !== draggedItemId)
            : contentIds
        );
      }

      setLocalPreview(preview);
    },
    [draggedItemId, previewExists]
  );

  useEffect(() => {
    updateContent(contentIds, preview, isDragging);
  }, [contentIds, preview, isDragging]);

  return [contentIdsWithPreview, localPreview];
};
