import { Config, Data, MappedItem } from "../types/Config";
import { resolveAllComponentData } from "./resolve-component-data";
import { resolveRootData } from "./resolve-root-data";
import { defaultData } from "./default-data";

export async function resolveAllData(
  data: Partial<Data>,
  config: Config,
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) {
  const defaultedData = defaultData(data);

  const dynamicRoot = await resolveRootData(defaultedData, config);

  const { zones = {} } = data;

  const zoneKeys = Object.keys(zones);
  const resolvedZones: Record<string, MappedItem[]> = {};

  for (let i = 0; i < zoneKeys.length; i++) {
    const zoneKey = zoneKeys[i];
    resolvedZones[zoneKey] = await resolveAllComponentData(
      zones[zoneKey],
      config,
      onResolveStart,
      onResolveEnd
    );
  }

  return {
    ...defaultedData,
    root: dynamicRoot,
    content: await resolveAllComponentData(
      defaultedData.content,
      config,
      onResolveStart,
      onResolveEnd
    ),
    zones: resolvedZones,
  };
}
