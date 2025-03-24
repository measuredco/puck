import { ZoneType } from "../store/slices/zones";
import { ComponentData, Config, Content, Data, RootData } from "../types";

export function dataMap<UserData extends Data>(
  data: Partial<UserData>,
  map: <T extends ComponentData | RootData>(
    data: T,
    index: number,
    zoneType: ZoneType
  ) => T,
  config: Config
): UserData {
  const content = data.content || [];
  const zones: UserData["zones"] = data.zones || {};

  function mapSlots<T extends ComponentData | RootData>(
    item: T,
    index: number,
    zoneType: ZoneType
  ): T {
    if (!item) return item;

    const componentType = "type" in item ? item.type : "root";
    const props: Record<string, any> = { ...item.props };

    const configForComponent =
      componentType === "root" ? config.root : config.components[componentType];

    if (!configForComponent?.fields) return map(item, index, zoneType);

    const propKeys = Object.keys(configForComponent.fields || {});

    for (let i = 0; i < propKeys.length; i++) {
      const propKey = propKeys[i];

      const field = configForComponent.fields[propKey];

      if (field.type === "slot") {
        const childContent = (props[propKey] || []) as Content;

        if (!childContent.map) continue;

        props[propKey] = childContent.map((item, index) =>
          mapSlots(item, index, "slot")
        );
      }
    }

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
