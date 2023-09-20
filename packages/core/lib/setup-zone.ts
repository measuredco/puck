import { Data } from "../types/Config";
import { rootDroppableId } from "./root-droppable-id";

export const setupZone = (data: Data, zoneKey: string): Required<Data> => {
  if (zoneKey === rootDroppableId) {
    return data as Required<Data>;
  }

  const newData = { ...data };

  newData.zones = data.zones || {};

  newData.zones[zoneKey] = newData.zones[zoneKey] || [];

  return newData as Required<Data>;
};
