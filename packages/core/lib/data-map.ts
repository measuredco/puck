import { ComponentData, Content, Data, RootData } from "../types";
import { forEachSlot } from "./flatten-slots";

function mapSlotsRecursive<T extends ComponentData | RootData>(
  item: T,
  index: number,
  map: (data: T, index: number) => T
): T {
  if (!item) return item;

  const props: Record<string, any> = { ...item.props };

  forEachSlot(item, (_parentId, propName, content) => {
    props[propName] = content.map((item, index) =>
      mapSlotsRecursive(item as any, index, map)
    );
  });

  return map({ ...item, props }, index);
}

export function mapSlots<T extends ComponentData | RootData>(
  item: T,
  map: (data: T, index: number) => T
): T {
  return mapSlotsRecursive(item, -1, map);
}

export function dataMap<UserData extends Data>(
  data: Partial<UserData>,
  map: <T extends ComponentData | RootData<Record<string, any>>>(
    data: T,
    index: number
  ) => T
): UserData {
  const content = data.content || [];
  const zones: UserData["zones"] = data.zones || {};

  return {
    ...data,
    // TODO root changes cause full re-renders
    // root: mapSlotsRecursive(data.root || {}, -1, map),
    content: content.map((item, index) => mapSlotsRecursive(item, index, map)),
    zones: {
      ...Object.keys(zones).reduce<Record<string, Content>>((acc, zoneId) => {
        return {
          ...acc,
          [zoneId]: zones[zoneId].map((item, index) =>
            mapSlotsRecursive(item, index, map)
          ),
        };
      }, {}),
    },
  } as UserData;
}
