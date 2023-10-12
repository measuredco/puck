import type { AppData } from "../types/Config";
import { addToZoneCache } from "../reducer/data";

/**
 * Flush out all zones and let them re-register using the zone cache
 *
 * @param appData initial app state
 * @returns appData with zones removed from data
 */
export const flushZones = (appData: AppData): AppData => {
  const containsZones = typeof appData.data.zones !== "undefined";

  if (containsZones) {
    Object.keys(appData.data.zones || {}).forEach((zone) => {
      addToZoneCache(zone, appData.data.zones![zone]);
    });

    return {
      ...appData,
      data: {
        ...appData.data,
        zones: {},
      },
    };
  }

  return appData;
};
