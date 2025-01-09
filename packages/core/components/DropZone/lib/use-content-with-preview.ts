import { Content } from "../../../types";
import { Preview } from "./../context";
import { useEffect, useState } from "react";
import { useRenderedCallback } from "../../../lib/dnd/use-rendered-callback";
import { insert } from "../../../lib/insert";
import { ZoneStoreContext } from "../context";
import { useContextStore } from "../../../lib/use-context-store";

export const useContentWithPreview = (
  content: Content,
  zoneCompound: string
) => {
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

  const [contentWithPreview, setContentWithPreview] = useState(content);

  const updateContent = useRenderedCallback(
    (content: Content, preview: Preview | undefined) => {
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
    },
    [draggedItemId, previewExists]
  );

  useEffect(() => {
    updateContent(content, preview);
  }, [content, preview]);

  return contentWithPreview;
};
