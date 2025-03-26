import { ComponentData, Content, Data, RootData } from "../types";
import { dataMap } from "./data-map";

const isSlot = (prop: any) =>
  Array.isArray(prop) &&
  typeof prop[0]?.type === "string" &&
  typeof prop[0]?.props === "object";

export const forEachSlot = <T extends ComponentData | RootData>(
  item: T,
  cb: (parentId: string, slotId: string, content: Content) => void
) => {
  const props: Record<string, any> = item.props || {};

  const propKeys = Object.keys(props);

  for (let i = 0; i < propKeys.length; i++) {
    const propKey = propKeys[i];

    if (isSlot(props[propKey])) {
      cb(props.id, propKey, props[propKey]);
    }
  }
};

export const reduceSlots = <T extends ComponentData | RootData>(
  item: T,
  map: (parentId: string, slotId: string, content: Content) => ComponentData
) => {
  const props: Record<string, any> = item.props || {};

  forEachSlot(item, (parentId, slotId, content) => {
    props[slotId] = map(parentId, slotId, content);
  });

  return { ...item, props };
};

export const flattenSlots = <UserData extends Data = Data>(
  data: Partial<UserData>
): Record<string, Content> => {
  let slots: Record<string, Content> = {};

  const map = <T extends ComponentData | RootData>(item: T) => {
    forEachSlot(item, (parentId, propName, content) => {
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
  data: Partial<UserData>
): Record<string, Content> => {
  const allSlots: Record<string, Content> = {};

  dataMap(data, (item) => {
    forEachSlot(item, (parentId, propName, content) => {
      allSlots[`${parentId}:${propName}`] = content;
    });

    return item;
  });

  return allSlots;
};

export const mergeSlots = <UserData extends Data = Data>(
  data: Partial<UserData>
): UserData => {
  const zones: Record<string, Content> = { ...data.zones };

  const mapped = dataMap(data, (item) => {
    if (!item?.props) return item;

    const newProps: Record<string, any> = {};

    forEachSlot(item, (parentId, propName, content) => {
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
  });

  return {
    ...mapped,
    zones,
  };
};
