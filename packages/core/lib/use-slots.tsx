import { ReactNode, useMemo } from "react";
import { ComponentData, Config, Content } from "../types";
import { DropZoneProps } from "../components/DropZone/types";
import { mapSlotsSync } from "./data/map-slots";

export function useSlots(
  config: Config,
  item: ComponentData,
  renderSlotEdit: (dzProps: DropZoneProps & { content: Content }) => ReactNode,
  renderSlotRender: (
    dzProps: DropZoneProps & { content: Content }
  ) => ReactNode = renderSlotEdit,
  readOnly?: ComponentData["readOnly"],
  forceReadOnly?: boolean
): ComponentData["props"] {
  const slotProps = useMemo(() => {
    const mapped = mapSlotsSync(
      item,
      (content, _parentId, propName, field, propPath) => {
        const wildcardPath = propPath.replace(/\[\d+\]/g, "[*]");
        const isReadOnly =
          readOnly?.[propPath] || readOnly?.[wildcardPath] || forceReadOnly;

        const render = isReadOnly ? renderSlotRender : renderSlotEdit;

        const Slot = (dzProps: DropZoneProps) =>
          render({
            allow: field?.type === "slot" ? field.allow : [],
            disallow: field?.type === "slot" ? field.disallow : [],
            ...dzProps,
            zone: propName,
            content,
          });

        return Slot;
      },
      config
    ).props;

    return mapped;
  }, [config, item, readOnly, forceReadOnly]);

  const mergedProps = useMemo(
    () => ({ ...item.props, ...slotProps }),
    [item.props, slotProps]
  );

  return mergedProps;
}
