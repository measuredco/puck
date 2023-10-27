import { Config, Data, MappedItem } from "../types/Config";
import { resolveAllProps } from "./resolve-all-props";

export const resolveData = async (
  data: Data,
  config: Config,
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  const { zones = {} } = data;

  const zoneKeys = Object.keys(zones);
  const resolvedZones: Record<string, MappedItem[]> = {};

  for (let i = 0; i < zoneKeys.length; i++) {
    const zoneKey = zoneKeys[i];
    resolvedZones[zoneKey] = await resolveAllProps(
      zones[zoneKey],
      config,
      onResolveStart,
      onResolveEnd
    );
  }

  return {
    ...data,
    content: await resolveAllProps(
      data.content,
      config,
      onResolveStart,
      onResolveEnd
    ),
    zones: resolvedZones,
  };
};
