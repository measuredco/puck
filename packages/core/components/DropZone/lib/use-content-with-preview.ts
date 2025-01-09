import { useShallow } from "zustand/react/shallow";
import { Content } from "../../../types";
import { Preview, useZoneStore } from "./../context";
import { useEffect, useState } from "react";
import { useRenderedCallback } from "../../../lib/dnd-kit/use-rendered-callback";
import { insert } from "../../../lib/insert";

export const useContentWithPreview = (
  content: Content,
  providerId: string,
  zoneCompound: string
) => {
  const { draggedItemId, preview, previewExists } = useZoneStore(
    useShallow((s) => {
      const providerState = s[providerId];

      return {
        draggedItemId: providerState?.draggedItem?.id,
        preview: providerState?.previewIndex[zoneCompound],
        previewExists:
          Object.keys(providerState?.previewIndex || {}).length > 0,
      };
    })
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
