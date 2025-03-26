import { Config, Content, Data } from "../types";
import { reorder } from "../lib/reorder";
import { rootDroppableId } from "../lib/root-droppable-id";
import { insert } from "../lib/insert";
import { remove } from "../lib/remove";
import { setupZone } from "../lib/setup-zone";
import { replace } from "../lib/replace";
import { getItem } from "../lib/get-item";
import {
  duplicateRelatedZones,
  removeRelatedZones,
} from "../lib/reduce-related-zones";
import { generateId } from "../lib/generate-id";
import {
  InsertAction,
  PuckAction,
  ReplaceAction,
  ReorderAction,
} from "./actions";
import {} from "./actions";
import { AppStore } from "../store";
import { dataMap, mapSlots } from "../lib/data-map";
import { reduceSlots } from "../lib/flatten-slots";

// Restore unregistered zones when re-registering in same session
export const zoneCache: Record<string, Content> = {};

export const addToZoneCache = (key: string, data: Content) => {
  zoneCache[key] = data;
};

const updateContent = <UserData extends Data>(
  data: UserData,
  zoneCompound: string,
  map: (content: Content) => Content
) => {
  if (zoneCompound === rootDroppableId) {
    return {
      ...data,
      content: map(data.content),
    };
  }

  const zones = data.zones || {};
  const zone = zones[zoneCompound];

  if (zone) {
    return {
      ...data,
      zones: {
        ...data.zones,
        [zoneCompound]: map(zone),
      },
    };
  }

  const [parentId, zoneId] = zoneCompound.split(":");

  return dataMap(data, (item) => {
    if (!item.props) return item;

    if ("id" in item.props && item.props.id === parentId) {
      return {
        ...item,
        props: {
          ...item.props,
          [zoneId]: map(item.props[zoneId]),
        },
      };
    }

    return item;
  }) as UserData;
};

export const replaceAction = <UserData extends Data>(
  data: UserData,
  action: ReplaceAction
) => {
  return updateContent(data, action.destinationZone, (content) =>
    replace(content, action.destinationIndex, action.data)
  );
};

export function insertAction<UserData extends Data>(
  data: UserData,
  action: InsertAction,
  config: Config
) {
  const emptyComponentData = {
    type: action.componentType,
    props: {
      ...(config.components[action.componentType].defaultProps || {}),
      id: action.id || generateId(action.componentType),
    },
  };

  return updateContent(data, action.destinationZone, (content) =>
    insert(content, action.destinationIndex, emptyComponentData)
  );
}

const reorderAction = <UserData extends Data>(
  data: UserData,
  action: ReorderAction
) => {
  return updateContent(data, action.destinationZone, (content) =>
    reorder(content, action.sourceIndex, action.destinationIndex)
  );
};

export function reduceData<UserData extends Data>(
  data: UserData,
  action: PuckAction,
  appStore: AppStore
): UserData {
  if (action.type === "insert") {
    return insertAction(data, action, appStore.config);
  }

  if (action.type === "duplicate") {
    const item = getItem(
      { index: action.sourceIndex, zone: action.sourceZone },
      appStore
    )!;

    const newItem = mapSlots(
      {
        ...item,
        props: {
          ...item.props,
          id: generateId(item.type),
        },
      },
      (item) => ({
        ...item,
        props: { ...item.props, id: generateId(item.type) },
      })
    );

    const dataWithRelatedDuplicated = duplicateRelatedZones<UserData>(
      item,
      data,
      newItem.props.id
    );

    return updateContent(
      dataWithRelatedDuplicated,
      action.sourceZone,
      (content) => insert(content, action.sourceIndex + 1, newItem)
    );
  }

  if (action.type === "reorder") {
    return reorderAction(data, action);
  }

  if (action.type === "move") {
    if (
      action.sourceZone === action.destinationZone &&
      action.sourceIndex === action.destinationIndex
    ) {
      return data;
    }

    const item = getItem(
      { zone: action.sourceZone, index: action.sourceIndex },
      appStore
    );

    const dataWithRemoved = updateContent(data, action.sourceZone, (content) =>
      remove(content, action.sourceIndex)
    );

    return updateContent(dataWithRemoved, action.destinationZone, (content) =>
      insert(content, action.destinationIndex, item)
    );
  }

  if (action.type === "replace") {
    return replaceAction(data, action);
  }

  if (action.type === "remove") {
    const item = getItem({ index: action.index, zone: action.zone }, appStore)!;

    return updateContent(
      removeRelatedZones(item, data),
      action.zone,
      (content) => remove(content, action.index)
    );
  }

  if (action.type === "registerZone") {
    if (zoneCache[action.zone]) {
      return {
        ...data,
        zones: {
          ...data.zones,
          [action.zone]: zoneCache[action.zone],
        },
      };
    }

    return setupZone(data, action.zone);
  }

  if (action.type === "unregisterZone") {
    const _zones = { ...(data.zones || {}) };

    if (_zones[action.zone]) {
      zoneCache[action.zone] = _zones[action.zone];

      delete _zones[action.zone];
    }

    return { ...data, zones: _zones };
  }

  if (action.type === "setData") {
    if (typeof action.data === "object") {
      return {
        ...data,
        ...action.data,
      };
    }

    return { ...data, ...action.data(data) };
  }

  return data;
}
