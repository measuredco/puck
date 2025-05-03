import { ReactNode, useMemo } from "react";
import {
  ComponentConfig,
  Content,
  DefaultComponentProps,
  RootConfig,
} from "../types";
import { DropZoneProps } from "../components/DropZone/types";

export function useSlots<T extends DefaultComponentProps>(
  config: ComponentConfig | RootConfig | null | undefined,
  props: T,
  renderSlot: (dzProps: DropZoneProps & { content: Content }) => ReactNode
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

        const Slot = (dzProps: DropZoneProps) =>
          renderSlot({
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
  }, [config]);

  return { ...props, ...slotProps };
}
