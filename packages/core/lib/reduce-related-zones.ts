import { Data } from "../types/Config";
import { generateId } from "./generate-id";
import { getZoneId } from "./get-zone-id";

export const reduceRelatedZones = (
  item: Data["content"][0],
  data: Data,
  fn: (
    zones: Required<Data>["zones"],
    key: string,
    zone: Required<Data>["zones"][0]
  ) => Required<Data>["zones"]
) => {
  return {
    ...data,
    zones: Object.keys(data.zones || {}).reduce<Required<Data>["zones"]>(
      (acc, key) => {
        const [parentId] = getZoneId(key);

        if (parentId === item.props.id) {
          const zones = data.zones!;
          return fn(acc, key, zones[key]);
        }

        return { ...acc, [key]: data.zones![key] };
      },
      {}
    ),
  };
};

const findRelatedByZoneId = (zoneId: string, data: Data) => {
  const [zoneParentId] = getZoneId(zoneId);

  return (data.zones![zoneId] || []).reduce((acc, zoneItem) => {
    const related = findRelatedByItem(zoneItem, data);

    if (zoneItem.props.id === zoneParentId) {
      return { ...acc, ...related, [zoneId]: zoneItem };
    }

    return { ...acc, ...related };
  }, {});
};

const findRelatedByItem = (item: Data["content"][0], data: Data) => {
  return Object.keys(data.zones || {}).reduce((acc, zoneId) => {
    const [zoneParentId] = getZoneId(zoneId);

    if (item.props.id === zoneParentId) {
      const related = findRelatedByZoneId(zoneId, data);

      return {
        ...acc,
        ...related,
        [zoneId]: data.zones![zoneId],
      };
    }

    return acc;
  }, {});
};

/**
 * Remove all related zones
 */
export const removeRelatedZones = (item: Data["content"][0], data: Data) => {
  const newData = { ...data };

  const related = findRelatedByItem(item, data);

  Object.keys(related).forEach((key) => {
    delete newData.zones![key];
  });

  return newData;
};

export const duplicateRelatedZones = (
  item: Data["content"][0],
  data: Data,
  newId: string
) => {
  return reduceRelatedZones(item, data, (acc, key, zone) => {
    const dupedZone = zone.map((zoneItem) => ({
      ...zoneItem,
      props: { ...zoneItem.props, id: generateId(zoneItem.type) },
    }));

    // We need to dupe any related items in our dupes
    const dupeOfDupes = dupedZone.reduce(
      (dupeOfDupes, item, index) => ({
        ...dupeOfDupes,
        ...duplicateRelatedZones(zone[index], data, item.props.id).zones,
      }),
      acc
    );

    const [_, zoneId] = getZoneId(key);

    return {
      ...dupeOfDupes,
      [key]: zone,
      [`${newId}:${zoneId}`]: dupedZone,
    };
  });
};
