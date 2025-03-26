import { ZoneType } from "../store/slices/zones";
import { ComponentData, Config, Content, Data, RootData } from "../types";
import { forEachSlot } from "./flatten-slots";

export function dataMap<UserData extends Data>(
  data: Partial<UserData>,
  map: <T extends ComponentData | RootData>(
    data: T,
    index: number,
    zoneType: ZoneType
  ) => T,
  config: Config,
  deep: boolean = true
): UserData {
  const content = data.content || [];
  const zones: UserData["zones"] = data.zones || {};

  function mapSlots<T extends ComponentData | RootData>(
    item: T,
    index: number,
    zoneType: ZoneType
  ): T {
    if (!item) return item;

    const props: Record<string, any> = { ...item.props };

    forEachSlot(item, config, (parentId, propName, content) => {
      props[propName] = content.map((item, index) =>
        mapSlots(item, index, "slot")
      );
    });

    return map({ ...item, props }, index, zoneType);
  }

  return {
    ...data,
    root: mapSlots(data.root || {}, -1, "root"),
    content: content.map((item, index) => mapSlots(item, index, "root")),
    zones: {
      ...Object.keys(zones).reduce<Record<string, Content>>((acc, zoneId) => {
        return {
          ...acc,
          [zoneId]: zones[zoneId].map((item, index) =>
            mapSlots(item, index, "dropzone")
          ),
        };
      }, {}),
    },
  } as UserData;
}
