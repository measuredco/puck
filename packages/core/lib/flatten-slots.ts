import { ComponentData, Config, Content, Data, RootData } from "../types";
import { dataMap } from "./data-map";

export const flattenSlots = (
  config: Config,
  data: Partial<Data>
): Record<string, Content> => {
  let slots: Record<string, Content> = {};

  const map = <T extends ComponentData | RootData>(item: T): T => {
    const componentType = "type" in item ? item.type : "root";
    const props: Record<string, any> = item.props || {};

    const configForComponent =
      componentType === "root" ? config.root : config.components[componentType];

    if (!configForComponent?.fields) return item;

    const propKeys = Object.keys(configForComponent.fields || {});

    for (let i = 0; i < propKeys.length; i++) {
      const propKey = propKeys[i];

      const field = configForComponent.fields[propKey];

      if (field.type === "slot") {
        const childContent = (props[propKey] || []) as Content;

        if (!childContent.map) continue;

        childContent.map(map);

        slots = {
          ...slots,
          [`${props.id}:${propKey}`]: props[propKey],
        };
      }
    }

    return item;
  };

  dataMap(data, map, config);

  return slots;
};
