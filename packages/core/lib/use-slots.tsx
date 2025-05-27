import { ReactNode, useMemo } from "react";
import { ComponentData, Content } from "../types";
import { DropZoneProps } from "../components/DropZone/types";
import { mapSlotsSync } from "./data/map-slots";
import { useAppStoreApi } from "../store";

export function useSlots<T extends ComponentData>(
  item: T,
  renderSlotEdit: (dzProps: DropZoneProps & { content: Content }) => ReactNode,
  renderSlotRender: (
    dzProps: DropZoneProps & { content: Content }
  ) => ReactNode = renderSlotEdit,
  readOnly?: ComponentData["readOnly"],
  forceReadOnly?: boolean
): T["props"] {
  const appStore = useAppStoreApi();

  const slotProps = useMemo(() => {
    const config = appStore.getState().config;

    const mapped = mapSlotsSync(
      item,
      (content, _parentId, propName, field) => {
        // TODO fix readOnly for array / object fields
        const render =
          readOnly?.[propName] || forceReadOnly
            ? renderSlotRender
            : renderSlotEdit;

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
  }, [item, readOnly, forceReadOnly]);

  const mergedProps = useMemo(
    () => ({ ...item.props, ...slotProps }),
    [item.props, slotProps]
  );

  return mergedProps;
}
