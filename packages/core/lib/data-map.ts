import { ComponentData, Content, Data, RootData } from "../types";

export const dataMap = (
  data: Partial<Data>,
  map: <T extends ComponentData | RootData>(data: T) => T
): Data => {
  const content = data.content || [];
  const zones = data.zones || {};

  return {
    ...data,
    root: map(data.root || {}),
    content: content.map(map),
    zones: {
      ...Object.keys(zones).reduce<Record<string, Content>>((acc, zoneId) => {
        return { ...acc, [zoneId]: zones[zoneId].map(map) };
      }, {}),
    },
  };
};
