import { rootDroppableId } from "./root-droppable-id";

export const getZoneId = (zoneCompound?: string) => {
  if (!zoneCompound) {
    return [];
  }

  if (zoneCompound && zoneCompound.indexOf(":") > -1) {
    return zoneCompound.split(":");
  }

  return [rootDroppableId, zoneCompound];
};
