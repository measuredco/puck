import { ZoneType } from "../store/slices/zones";
import { ComponentData, Content, Data, RootData } from "../types";
import { forEachSlot } from "./flatten-slots";

function mapSlotsRecursive<T extends ComponentData | RootData>(
  item: T,
  index: number,
  zoneType: ZoneType,
  map: (data: T, index: number, zoneType: ZoneType) => T
): T {
  if (!item) return item;

  const props: Record<string, any> = { ...item.props };

  forEachSlot(item, (_parentId, propName, content) => {
    props[propName] = content.map((item, index) =>
      mapSlotsRecursive(item as any, index, "slot", map)
    );
  });

  return map({ ...item, props }, index, zoneType);
}

export function mapSlots<T extends ComponentData | RootData>(
  item: T,
  map: (data: T, index: number, zoneType: ZoneType) => T
): T {
  return mapSlotsRecursive(item, -1, "root", map);
}

export function dataMap<UserData extends Data>(
  data: Partial<UserData>,
  map: <T extends ComponentData | RootData>(
    data: T,
    index: number,
    zoneType: ZoneType
  ) => T
): UserData {
  const content = data.content || [];
  const zones: UserData["zones"] = data.zones || {};

  return {
    ...data,
    root: mapSlotsRecursive(data.root || {}, -1, "root", map),
    content: content.map((item, index) =>
      mapSlotsRecursive(item, index, "root", map)
    ),
    zones: {
      ...Object.keys(zones).reduce<Record<string, Content>>((acc, zoneId) => {
        return {
          ...acc,
          [zoneId]: zones[zoneId].map((item, index) =>
            mapSlotsRecursive(item, index, "dropzone", map)
          ),
        };
      }, {}),
    },
  } as UserData;
}
