import { Content, Data } from "../types/Config";
import { getZoneId } from "./get-zone-id";

export const findZonesForArea = (
  data: Data,
  area: string
): Record<string, Content> => {
  const { zones = {} } = data;

  const result = Object.keys(zones).filter(
    (zoneId) => getZoneId(zoneId)[0] === area
  );

  return result.reduce((acc, key) => {
    return { ...acc, [key]: zones[key] };
  }, {});
};
