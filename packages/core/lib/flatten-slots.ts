import { ComponentData, Content, Data, RootData } from "../types";
import { dataMap } from "./data-map";

export const isSlot = (prop: any) =>
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

// export const reduceSlots = <T extends ComponentData | RootData>(
//   item: T,
//   map: (parentId: string, slotId: string, content: Content) => ComponentData
// ) => {
//   const props: Record<string, any> = item.props || {};

//   forEachSlot(item, (parentId, slotId, content) => {
//     props[slotId] = map(parentId, slotId, content);
//   });

//   return { ...item, props };
// };

/**
 * Collects every slot into a record keyed by `parentId:propKey`.
 */
export function flattenSlots<UserData extends Data = Data>(
  data: Partial<UserData>
): Record<string, Content> {
  const slots: Record<string, Content> = {};

  const gather = (item: ComponentData | RootData<Record<string, any>>) => {
    if (!item?.props) return;
    for (const propKey in item.props) {
      const val = item.props[propKey];
      if (isSlot(val)) {
        slots[`${item.props.id}:${propKey}`] = val;
      }
    }
  };

  // Root
  if (data.root) gather(data.root);
  data.content?.forEach(gather);
  for (const zoneId in data.zones || {}) {
    data.zones?.[zoneId].forEach(gather);
  }

  return slots;
}

/**
 * Collects all slots by running dataMap once, which also visits everything.
 */
export function flattenAllSlots<UserData extends Data = Data>(
  data: Partial<UserData>
): Record<string, Content> {
  const allSlots: Record<string, Content> = {};

  dataMap(data, (item) => {
    if (!item?.props) return item;
    for (const propKey in item.props) {
      const val = item.props[propKey];
      if (isSlot(val)) {
        allSlots[`${item.props.id}:${propKey}`] = val;
      }
    }
    return item;
  });

  return allSlots;
}

/**
 * Merges slot data from `data.zones` if present, otherwise uses existing slot content.
 * Leaves any leftover zones in place.
 */
export function mergeSlots<UserData extends Data = Data>(
  data: Partial<UserData>
): UserData {
  const zones: Record<string, Content> = { ...(data.zones ?? {}) };

  // We do an in-place map, updating slot props if a matching zone key exists
  dataMap(data, (item) => {
    if (!item?.props) return item;
    for (const propKey in item.props) {
      if (isSlot(item.props[propKey])) {
        const zoneId = `${item.props.id}:${propKey}`;
        if (zones.hasOwnProperty(zoneId)) {
          item.props[propKey] = zones[zoneId];
          delete zones[zoneId];
        }
      }
    }
    return item;
  });

  // Keep leftover zones
  return { ...data, zones } as UserData;
}
