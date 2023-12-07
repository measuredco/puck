import { Data } from "../types/Config";
import { findZonesForArea } from "./find-zones-for-area";

export const areaContainsZones = (data: Data, area: string) => {
  const zones = Object.keys(findZonesForArea(data, area));

  return zones.length > 0;
};
