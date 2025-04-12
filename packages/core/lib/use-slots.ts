import { ReactNode, useMemo } from "react";
import {
  ComponentConfig,
  Content,
  DefaultComponentProps,
  RootConfig,
  WithPuckProps,
} from "../types";
import { DropZoneProps } from "../components/DropZone/types";

export function useSlots(
  config: ComponentConfig | RootConfig | null | undefined,
  props: WithPuckProps<DefaultComponentProps>,
  renderSlot: (dzProps: DropZoneProps & { content: Content }) => ReactNode
): any {
  return useMemo(() => {
    if (!config?.fields) return props;

    const newProps: DefaultComponentProps = { ...props };
    const fieldKeys = Object.keys(config.fields);

    for (let i = 0; i < fieldKeys.length; i++) {
      const fieldKey = fieldKeys[i];
      const field = config.fields[fieldKey];

      if (field?.type === "slot") {
        newProps[fieldKey] = (dzProps: DropZoneProps) =>
          renderSlot({
            ...dzProps,
            zone: fieldKey,
            content: props[fieldKey] || [],
          });
      }
    }

    return newProps;
  }, [config, props]);
}
