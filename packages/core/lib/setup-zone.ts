import { CurrentData } from "../types/Config";
import { rootDroppableId } from "./root-droppable-id";

export const setupZone = (
  data: CurrentData,
  zoneKey: string
): Required<CurrentData> => {
  if (zoneKey === rootDroppableId) {
    return data as Required<CurrentData>;
  }

  const newData = { ...data };

  newData.zones = data.zones || {};

  newData.zones[zoneKey] = newData.zones[zoneKey] || [];

  return newData as Required<CurrentData>;
};
