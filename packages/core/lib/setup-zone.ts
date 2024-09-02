import { Data } from "../types/Config";
import { rootDroppableId } from "./root-droppable-id";

// Force 'zones' to always be present and non-undefined
type WithZones<T extends Data> = T & { zones: NonNullable<T["zones"]> };

// Ensuring zones is non-undefined and part of the final type
function ensureZones<UserData extends Data>(
  data: UserData
): WithZones<UserData> {
  return {
    ...data,
    zones: data.zones || {},
  } as WithZones<UserData>;
}

export const setupZone = <UserData extends Data>(
  data: UserData,
  zoneKey: string
): Required<WithZones<UserData>> => {
  if (zoneKey === rootDroppableId) {
    return data as Required<WithZones<UserData>>;
  }

  // Preprocess to ensure zones is not undefined
  const newData = ensureZones(data);

  newData.zones[zoneKey] = newData.zones[zoneKey] || [];

  return newData as Required<WithZones<UserData>>;
};
