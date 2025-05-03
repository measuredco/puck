import { ReactNode, useMemo } from "react";
import {
  ComponentConfig,
  ComponentData,
  Content,
  DefaultComponentProps,
  RootConfig,
} from "../types";
import { DropZoneProps } from "../components/DropZone/types";

export function useSlots<T extends DefaultComponentProps>(
  config: ComponentConfig | RootConfig | null | undefined,
  props: T,
  renderSlotEdit: (dzProps: DropZoneProps & { content: Content }) => ReactNode,
  renderSlotRender: (
    dzProps: DropZoneProps & { content: Content }
  ) => ReactNode = renderSlotEdit,
  readOnly?: ComponentData["readOnly"],
  forceReadOnly?: boolean
): T {
  const slotProps = useMemo(() => {
    if (!config?.fields) return props;

    const slotProps: DefaultComponentProps = {};
    const fieldKeys = Object.keys(config.fields);

    for (let i = 0; i < fieldKeys.length; i++) {
      const fieldKey = fieldKeys[i];
      const field = config.fields[fieldKey];

      if (field?.type === "slot") {
        const content = props[fieldKey] || [];

        const render =
          readOnly?.[fieldKey] || forceReadOnly
            ? renderSlotRender
            : renderSlotEdit;

        const Slot = (dzProps: DropZoneProps) =>
          render({
            allow: field.allow,
            disallow: field.disallow,
            ...dzProps,
            zone: fieldKey,
            content,
          });

        slotProps[fieldKey] = Slot;
      }
    }

    return slotProps;
  }, [config, readOnly, forceReadOnly]);

  return { ...props, ...slotProps };
}
