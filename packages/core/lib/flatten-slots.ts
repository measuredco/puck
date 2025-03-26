import { ComponentData, Config, Content, Data, RootData } from "../types";
import { dataMap } from "./data-map";

export const forEachSlot = <T extends ComponentData | RootData>(
  item: T,
  config: Config,
  cb: (parentId: string, slotId: string, content: Content) => void
) => {
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
      cb(props.id, propKey, props[propKey]);
    }
  }
};

export const flattenSlots = <UserData extends Data = Data>(
  config: Config,
  data: Partial<UserData>
): Record<string, Content> => {
  let slots: Record<string, Content> = {};

  const map = <T extends ComponentData | RootData>(item: T) => {
    forEachSlot(item, config, (parentId, propName, content) => {
      slots = {
        ...slots,
        [`${parentId}:${propName}`]: content,
      };
    });
  };

  map(data.root || {});
  data.content?.forEach(map);
  Object.keys(data.zones || {}).forEach((zoneId) => {
    data.zones?.[zoneId].forEach(map);
  });

  return slots;
};

export const flattenAllSlots = <UserData extends Data = Data>(
  config: Config,
  data: Partial<UserData>
): Record<string, Content> => {
  const allSlots: Record<string, Content> = {};

  dataMap(
    data,
    (item) => {
      forEachSlot(item, config, (parentId, propName, content) => {
        allSlots[`${parentId}:${propName}`] = content;
      });

      return item;
    },
    config
  );

  return allSlots;
};

export const mergeSlots = <UserData extends Data = Data>(
  config: Config,
  data: Partial<UserData>
): UserData => {
  const zones: Record<string, Content> = { ...data.zones };

  const mapped = dataMap(
    data,
    (item) => {
      if (!item?.props) return item;

      const id = "id" in item.props ? item.props.id : "root";

      const newProps: Record<string, any> = {};

      forEachSlot(item, config, (parentId, propName, content) => {
        const zoneCompound = `${parentId}:${propName}`;
        newProps[propName] = zones[zoneCompound] ?? content;

        delete zones[zoneCompound];
      });

      return {
        ...item,
        props: {
          ...item.props,
          ...newProps,
        },
      };
    },
    config
  );

  return {
    ...mapped,
    zones,
  };
};
