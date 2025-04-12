import { useMemo } from "react";
import {
  ComponentConfig,
  DefaultComponentProps,
  RootConfig,
  WithId,
  WithPuckProps,
} from "../types";
import { DropZoneProps } from "../components/DropZone/types";
import { DropZoneEdit } from "../components/DropZone";

export function useSlots(
  config: ComponentConfig | RootConfig | null | undefined,
  props: WithPuckProps<DefaultComponentProps>
): any {
  return useMemo(() => {
    if (!config?.fields) return props;

    const newProps: DefaultComponentProps = { ...props };
    const fieldKeys = Object.keys(config.fields);

    for (let i = 0; i < fieldKeys.length; i++) {
      const fieldKey = fieldKeys[i];
      const field = config.fields[fieldKey];

      if (field?.type === "slot") {
        newProps[fieldKey] = (dzProps: DropZoneProps) => {
          return <DropZoneEdit {...dzProps} zone={fieldKey} />;
        };
      }
    }

    return newProps;
  }, [config, props]);
}
