import type { AppState } from "../types/Config";
import { addToZoneCache } from "../reducer/data";

/**
 * Flush out all zones and let them re-register using the zone cache
 *
 * @param appState initial app state
 * @returns appState with zones removed from data
 */
export const flushZones = (appState: AppState): AppState => {
  const containsZones = typeof appState.data.zones !== "undefined";

  if (containsZones) {
    Object.keys(appState.data.zones || {}).forEach((zone) => {
      addToZoneCache(zone, appState.data.zones![zone]);
    });

    return {
      ...appState,
      data: {
        ...appState.data,
        zones: {},
      },
    };
  }

  return appState;
};
