import { ComponentData, Config, Content, Data, PathSegment } from "../types";
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
  ReplaceByIdAction,
} from "./actions";
import {} from "./actions";
import { useDataIndexStore } from "../stores/data-index";

// Restore unregistered zones when re-registering in same session
export const zoneCache: Record<string, Content> = {};

export const addToZoneCache = (key: string, data: Content) => {
  zoneCache[key] = data;
};

function setItemById<UserData extends Data>(
  data: UserData,
  id: string,
  updateFn: (item: UserData["content"][0]) => UserData["content"][0]
): UserData {
  const { index } = useDataIndexStore.getState();

  const path = index[id].path;
  if (!path.length) {
    throw new Error(`Path not found for ID "${id}"`);
  }

  const reducer = (
    current: ComponentData,
    segment: PathSegment,
    pathIndex: number
  ) => {
    const { props } = current;

    const slot: Content = props[segment.propName];

    if (!slot || !Array.isArray(slot)) {
      throw new Error(
        `Invalid path: Property "${segment.propName}" is not a valid slot.`
      );
    }

    const updatedSlot = [...slot];
    const nextItem = updatedSlot[segment.index];

    if (!nextItem) {
      throw new Error(
        `Invalid path: Index ${segment.index} in slot "${segment.propName}" does not exist.`
      );
    }

    if (pathIndex === path.length - 1) {
      updatedSlot[segment.index] = updateFn(nextItem);
    } else {
      updatedSlot[segment.index] = reducer(
        nextItem,
        path[pathIndex + 1],
        pathIndex + 1
      );
    }

    return {
      ...current,
      props: {
        ...current.props,
        [segment.propName]: updatedSlot,
      },
    };
  };

  // Kick off the reducer from the root data object
  const rootSegment = path[0];
  if (!data.content[rootSegment.index]) {
    throw new Error(
      `Invalid path: Root item does not exist at index ${rootSegment.index}.`
    );
  }

  let rootItem: ComponentData = {
    type: "",
    props: { id: "", content: data.content },
  };

  return {
    ...data,
    content: reducer(rootItem, rootSegment, 0).props.content,
  };
}

export const replaceAction = <UserData extends Data>(
  data: UserData,
  _action: ReplaceAction | ReplaceByIdAction
) => {
  if (_action.id) {
    const action = _action as ReplaceByIdAction;

    const newData = setItemById(
      data,
      action.id,
      (item) => (item = action.data)
    );

    return newData;
  }

  const action = _action as ReplaceAction;

  if (action.destinationZone === rootDroppableId) {
    return {
      ...data,
      content: replace(data.content, action.destinationIndex, action.data),
    };
  }

  const newData = setupZone(data, action.destinationZone);

  return {
    ...newData,
    zones: {
      ...newData.zones,
      [action.destinationZone]: replace(
        newData.zones[action.destinationZone],
        action.destinationIndex,
        action.data
      ),
    },
  };
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
  }

  const newData = setupZone(data, action.destinationZone);

  return {
    ...data,
    zones: {
      ...newData.zones,
      [action.destinationZone]: insert(
        newData.zones[action.destinationZone],
        action.destinationIndex,
        emptyComponentData
      ),
    },
  };
}

const reorderAction = <UserData extends Data>(
  data: UserData,
  action: ReorderAction
) => {
  if (action.destinationZone === rootDroppableId) {
    return {
      ...data,
      content: reorder(
        data.content,
        action.sourceIndex,
        action.destinationIndex
      ),
    };
  }

  const newData = setupZone(data, action.destinationZone);

  return {
    ...data,
    zones: {
      ...newData.zones,
      [action.destinationZone]: reorder(
        newData.zones[action.destinationZone],
        action.sourceIndex,
        action.destinationIndex
      ),
    },
  };
};

export function reduceData<UserData extends Data>(
  data: UserData,
  action: PuckAction,
  config: Config
): UserData {
  if (action.type === "insert") {
    return insertAction(data, action, config);
  }

  if (action.type === "duplicate") {
    const item = getItem(
      { index: action.sourceIndex, zone: action.sourceZone },
      data
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
    return reorderAction(data, action);
  }

  if (action.type === "move") {
    if (
      action.sourceZone === action.destinationZone &&
      action.sourceIndex === action.destinationIndex
    ) {
      return data;
    }

    const newData = setupZone(
      setupZone(data, action.sourceZone),
      action.destinationZone
    );

    const item = getItem(
      { zone: action.sourceZone, index: action.sourceIndex },
      newData
    );

    if (action.sourceZone === action.destinationZone) {
      return reorderAction(data, { ...action, type: "reorder" });
    }

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
    return replaceAction(data, action);
  }

  if (action.type === "remove") {
    const item = getItem({ index: action.index, zone: action.zone }, data)!;

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
