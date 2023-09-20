import { Data } from "../types/Config";
import { addToZoneCache } from "./reducer";

/**
 * Flush out all zones and let them re-register using the zone cache
 *
 * @param data initial data
 * @returns data with zones removed
 */
export const flushZones = (data: Data): Data => {
  const containsZones = typeof data.zones !== "undefined";

  if (containsZones) {
    Object.keys(data.zones || {}).forEach((zone) => {
      addToZoneCache(zone, data.zones![zone]);
    });

    return {
      ...data,
      zones: {},
    };
  }

  return data;
};
