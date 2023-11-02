import { Config, Data, MappedItem } from "../types/Config";
import { resolveAllComponentData } from "./resolve-component-data";
import { resolveRootData } from "./resolve-root-data";

export const resolveAllData = async (
  data: Data,
  config: Config,
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  const dynamicRoot = await resolveRootData(data, config);

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
    ...data,
    root: dynamicRoot,
    content: await resolveAllComponentData(
      data.content,
      config,
      onResolveStart,
      onResolveEnd
    ),
    zones: resolvedZones,
  };
};
