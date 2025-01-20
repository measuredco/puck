import { Content } from "../../../types";
import { Preview } from "./../context";
import { useEffect, useState } from "react";
import { useRenderedCallback } from "../../../lib/dnd/use-rendered-callback";
import { insert } from "../../../lib/insert";
import { ZoneStoreContext } from "../context";
import { useContextStore } from "../../../lib/use-context-store";
import { useAppContext } from "../../Puck/context";

export const useContentWithPreview = (
  content: Content,
  zoneCompound: string
): [Content, Preview | undefined] => {
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

  // Refactor this once all state uses zustand
  const {
    state: {
      ui: { isDragging },
    },
  } = useAppContext();

  const [contentWithPreview, setContentWithPreview] = useState(content);
  const [localPreview, setLocalPreview] = useState<Preview | undefined>(
    preview
  );

  const updateContent = useRenderedCallback(
    (content: Content, preview: Preview | undefined, isDragging: boolean) => {
      // Preview is cleared but context hasn't yet caught up
      // This is necessary because Zustand clears the preview before the dispatcher finishes
      // Refactor this once all state has moved to Zustand.
      if (isDragging && !previewExists) {
        return;
      }

      if (preview) {
        if (preview.type === "insert") {
          setContentWithPreview(
            insert(
              content.filter((item) => item.props.id !== preview.props.id),
              preview.index,
              {
                type: "preview",
                props: { id: preview.props.id },
              }
            )
          );
        } else {
          setContentWithPreview(
            insert(
              content.filter((item) => item.props.id !== preview.props.id),
              preview.index,
              {
                type: preview.componentType,
                props: preview.props,
              }
            )
          );
        }
      } else {
        setContentWithPreview(
          previewExists
            ? content.filter((item) => item.props.id !== draggedItemId)
            : content
        );
      }

      setLocalPreview(preview);
    },
    [draggedItemId, previewExists]
  );

  useEffect(() => {
    updateContent(content, preview, isDragging);
  }, [content, preview, isDragging]);

  return [contentWithPreview, localPreview];
};
