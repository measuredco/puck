import { ComponentData, Config, Content, Data, RootData } from "../types";
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
import { dataMap } from "../lib/data-map";

// Restore unregistered zones when re-registering in same session
export const zoneCache: Record<string, Content> = {};

export const addToZoneCache = (key: string, data: Content) => {
  zoneCache[key] = data;
};

export const replaceAction = <UserData extends Data>(
  data: UserData,
  action: ReplaceAction,
  appStore: AppStore
) => {
  const id =
    appStore.zones.zones[action.destinationZone]?.contentIds[
      action.destinationIndex
    ];

  return dataMap(
    data,
    (item) => {
      if (!item.props) return item;

      if ("id" in item.props) {
        if (id === item.props.id) {
          return action.data;
        }
      }

      return item;
    },
    appStore.config
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

  if (action.destinationZone === rootDroppableId) {
    return {
      ...data,
      content: insert(
        data.content,
        action.destinationIndex,
        emptyComponentData
      ),
    };
    // DEPRECATED
  } else if (data.zones?.[action.destinationZone]) {
    return {
      ...data,
      zones: {
        ...data.zones,
        [action.destinationZone]: insert(
          data.zones[action.destinationZone],
          action.destinationIndex,
          emptyComponentData
        ),
      },
    };
  }

  const [parentId, zoneId] = action.destinationZone.split(":");

  return dataMap(
    data,
    (item) => {
      if (item.props && "id" in item.props && parentId === item.props.id) {
        return {
          ...item,
          props: {
            ...item.props,
            [zoneId]: insert(
              item.props[zoneId],
              action.destinationIndex,
              emptyComponentData
            ),
          },
        };
      }

      return item;
    },
    config
  );
}

const mapItem = (
  data: Data,
  config: Config,
  id: string,
  map: <T extends ComponentData | RootData>(item: T) => T
) => {
  return dataMap(
    data,
    (item) => {
      if (item.props && "id" in item.props && id === item.props.id) {
        return map(item);
      }

      return item;
    },
    config
  );
};

const reorderAction = <UserData extends Data>(
  data: UserData,
  action: ReorderAction,
  config: Config
) => {
  console.log("reordering", action, data);

  if (action.destinationZone === rootDroppableId) {
    return {
      ...data,
      content: reorder(
        data.content,
        action.sourceIndex,
        action.destinationIndex
      ),
    };
  } else if (data.zones?.[action.destinationZone]) {
    return {
      ...data,
      zones: {
        ...data.zones,
        [action.destinationZone]: reorder(
          data.zones[action.destinationZone],
          action.sourceIndex,
          action.destinationIndex
        ),
      },
    };
  }

  console.log("here");

  const [parentId, zoneId] = action.destinationZone.split(":");

  // return mapItem(data, config, parentId, (item) => ({
  //   ...item,
  //   props: {
  //     ...item.props,
  //     [zoneId]: reorder(
  //       item.props[zoneId],
  //       action.sourceIndex,
  //       action.destinationIndex
  //     ),
  //   },
  // }));

  const mapped = dataMap<UserData>(
    data,
    (item) => {
      if (item.props && "id" in item.props && parentId === item.props.id) {
        return {
          ...item,
          props: {
            ...item.props,
            [zoneId]: reorder(
              item.props[zoneId],
              action.sourceIndex,
              action.destinationIndex
            ),
          },
        };
      }

      return item;
    },
    config
  );

  console.log("mapped", mapped);

  return mapped;
};

export function reduceData<UserData extends Data>(
  data: UserData,
  action: PuckAction,
  appStore: AppStore
): UserData {
  if (action.type === "insert") {
    return insertAction(data, action, appStore.config) as UserData;
  }

  if (action.type === "duplicate") {
    const item = getItem(
      { index: action.sourceIndex, zone: action.sourceZone },
      appStore
    )!;

    const newItem = {
      ...item,
      props: {
        ...item.props,
        id: generateId(item.type),
      },
    };

    const dataWithRelatedDuplicated = duplicateRelatedZones<UserData>(
      item,
      data,
      newItem.props.id
    );

    if (action.sourceZone === rootDroppableId) {
      return {
        ...dataWithRelatedDuplicated,
        content: insert(data.content, action.sourceIndex + 1, newItem),
      };
    }

    return {
      ...dataWithRelatedDuplicated,
      zones: {
        ...dataWithRelatedDuplicated.zones,
        [action.sourceZone]: insert(
          dataWithRelatedDuplicated.zones![action.sourceZone],
          action.sourceIndex + 1,
          newItem
        ),
      },
    };
  }

  if (action.type === "reorder") {
    return reorderAction(data, action, appStore.config);
  }

  if (action.type === "move") {
    if (
      action.sourceZone === action.destinationZone &&
      action.sourceIndex === action.destinationIndex
    ) {
      return data;
    }

    if (action.sourceZone === action.destinationZone) {
      return reorderAction(
        data,
        { ...action, type: "reorder" },
        appStore.config
      );
    }

    return data;

    const newData = setupZone(
      setupZone(data, action.sourceZone),
      action.destinationZone
    );

    const item = getItem(
      { zone: action.sourceZone, index: action.sourceIndex },
      appStore
    );

    if (action.sourceZone === rootDroppableId) {
      return {
        ...newData,
        content: remove(newData.content, action.sourceIndex),
        zones: {
          ...newData.zones,

          [action.destinationZone]: insert(
            newData.zones[action.destinationZone],
            action.destinationIndex,
            item
          ),
        },
      };
    }

    if (action.destinationZone === rootDroppableId) {
      return {
        ...newData,
        content: insert(newData.content, action.destinationIndex, item),
        zones: {
          ...newData.zones,
          [action.sourceZone]: remove(
            newData.zones[action.sourceZone],
            action.sourceIndex
          ),
        },
      };
    }

    return {
      ...newData,
      zones: {
        ...newData.zones,
        [action.sourceZone]: remove(
          newData.zones[action.sourceZone],
          action.sourceIndex
        ),
        [action.destinationZone]: insert(
          newData.zones[action.destinationZone],
          action.destinationIndex,
          item
        ),
      },
    };
  }

  if (action.type === "replace") {
    return replaceAction(data, action, appStore);
  }

  if (action.type === "remove") {
    const item = getItem({ index: action.index, zone: action.zone }, appStore)!;

    // Remove any related zones
    const dataWithRelatedRemoved = setupZone(
      removeRelatedZones(item, data),
      action.zone
    );

    if (action.zone === rootDroppableId) {
      return {
        ...dataWithRelatedRemoved,
        content: remove(data.content, action.index),
      };
    }

    return {
      ...dataWithRelatedRemoved,
      zones: {
        ...dataWithRelatedRemoved.zones,
        [action.zone]: remove(
          dataWithRelatedRemoved.zones[action.zone],
          action.index
        ),
      },
    };
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
