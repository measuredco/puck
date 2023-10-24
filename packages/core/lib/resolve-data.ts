import { Config, Data, MappedItem } from "../types/Config";
import { resolveAllProps } from "./resolve-all-props";

export const resolveData = async (data: Data, config: Config) => {
  const { zones = {} } = data;

  const zoneKeys = Object.keys(zones);
  const resolvedZones: Record<string, MappedItem[]> = {};

  for (let i = 0; i < zoneKeys.length; i++) {
    const zoneKey = zoneKeys[i];
    resolvedZones[zoneKey] = await resolveAllProps(zones[zoneKey], config);
  }

  return {
    ...data,
    content: await resolveAllProps(data.content, config),
    zones: resolvedZones,
  };
};
