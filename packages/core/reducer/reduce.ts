import { ComponentData, Config, Content, Data } from "../types";
import { reorder } from "../lib/reorder";
import { rootDroppableId } from "../lib/root-droppable-id";
import { insert } from "../lib/insert";
import { remove } from "../lib/remove";
import { setupZone } from "../lib/setup-zone";
import { getItem } from "../lib/get-item";
import {
  duplicateRelatedZones,
  removeRelatedZones,
} from "../lib/reduce-related-zones";
import { generateId } from "../lib/generate-id";
import {
  InsertAction,
  PuckAction,
  ReorderAction,
  ReplaceAction,
  SetAction,
} from "./actions";
import {} from "./actions";
import { AppStore } from "../store";
import { dataMap, mapSlots } from "../lib/data-map";
import { NodeIndex, PrivateAppState, ZoneIndex } from "../types/Internal";
import { replace } from "../lib";
import {
  createNodeData,
  generateNodeIndex,
  generateZonesIndex,
} from "./indexes";
import { forEachSlot } from "../lib/flatten-slots";

// Restore unregistered zones when re-registering in same session
export const zoneCache: Record<string, Content> = {};

export const addToZoneCache = (key: string, data: Content) => {
  zoneCache[key] = data;
};

export const updateContent = <UserData extends Data>(
  data: UserData,
  zoneCompound: string,
  map: (content: Content) => Content
) => {
  if (zoneCompound === rootDroppableId) {
    const content = map(data.content);

    return {
      ...data,
      content: content,
    };
  }

  const zones = data.zones || {};
  const zone = zones[zoneCompound];

  if (zone) {
    const content = map(zone);

    return {
      ...data,
      zones: {
        ...data.zones,
        [zoneCompound]: content,
      },
    };
  }

  const [parentId, zoneId] = zoneCompound.split(":");

  return dataMap(data, (item) => {
    if (!item.props) return item;

    if ("id" in item.props && item.props.id === parentId) {
      const content = map(item.props[zoneId]);

      return {
        ...item,
        props: {
          ...item.props,
          [zoneId]: content,
        },
      };
    }

    return item;
  }) as UserData;
};

export function insertAction<UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: InsertAction,
  config: Config
): PrivateAppState<UserData> {
  const id = action.id || generateId(action.componentType);
  const emptyComponentData = {
    type: action.componentType,
    props: {
      ...(config.components[action.componentType].defaultProps || {}),
      id,
    },
  };

  const [parentId, zone] = action.destinationZone.split(":");

  return {
    ...state,
    data: updateContent(state.data, action.destinationZone, (content) =>
      insert(content || [], action.destinationIndex, emptyComponentData)
    ),
    indexes: {
      ...state.indexes,
      zones: {
        ...state.indexes.zones,
        [action.destinationZone]: {
          ...state.indexes.zones[action.destinationZone],
          contentIds: insert(
            state.indexes.zones[action.destinationZone]?.contentIds || [],
            action.destinationIndex,
            id
          ),
        },
      },
      nodes: {
        ...state.indexes.nodes,
        [id]: createNodeData(
          {
            data: emptyComponentData,
            parentId,
            zone,
          },
          state.indexes.nodes
        ),
      },
    },
  };
}

const reorderAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: ReorderAction
): PrivateAppState<UserData> => {
  return {
    ...state,
    data: updateContent(state.data, action.destinationZone, (content) =>
      reorder(content, action.sourceIndex, action.destinationIndex)
    ),
    indexes: {
      ...state.indexes,
      zones: {
        ...state.indexes.zones,
        [action.destinationZone]: {
          ...state.indexes.zones[action.destinationZone],
          contentIds: reorder(
            state.indexes.zones[action.destinationZone].contentIds,
            action.sourceIndex,
            action.destinationIndex
          ),
        },
      },
    },
  };
};

const deindexProps = (state: PrivateAppState, componentData: ComponentData) => {
  const zones: ZoneIndex = { ...state.indexes.zones };
  const nodes: NodeIndex = { ...state.indexes.nodes };

  forEachSlot(
    componentData,
    (parentId, slotId, content) => {
      const zoneCompound = `${parentId}:${slotId}`;

      delete zones[zoneCompound];

      content.forEach((item) => {
        delete nodes[item.props.id];
      });
    },
    true
  );

  delete nodes[componentData.props.id];

  return { nodes, zones };
};

const indexProps = (state: PrivateAppState, componentData: ComponentData) => {
  const zones: ZoneIndex = {};
  const nodes: NodeIndex = {};

  forEachSlot(
    componentData,
    (parentId, slotId, content) => {
      const zoneCompound = `${parentId}:${slotId}`;

      zones[zoneCompound] = {
        type: "slot",
        contentIds: content.map((i) => i.props.id),
      };

      content.forEach((item) => {
        nodes[item.props.id] = createNodeData(
          {
            data: item,
            parentId,
            zone: slotId,
          },
          { ...state.indexes.nodes, ...nodes }
        );
      });
    },
    true
  );

  return { nodes, zones };
};

export const replaceAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: ReplaceAction<UserData>
): PrivateAppState<UserData> => {
  // TODO deep zones index is causing global re-renders
  const deepIndexes = indexProps(state, action.data);

  console.log("replace", action, state.indexes.zones, deepIndexes.zones);

  return {
    data: updateContent(state.data, action.destinationZone, (content) =>
      replace(content, action.destinationIndex, action.data)
    ),
    ui: { ...state.ui, ...action.ui },
    indexes: {
      ...state.indexes,
      zones: {
        ...state.indexes.zones,
        ...deepIndexes.zones,
      },
      nodes: {
        ...state.indexes.nodes,
        ...deepIndexes.nodes,
        [action.data.props.id]: {
          ...state.indexes.nodes[action.data.props.id],
          data: action.data,
        },
      },
    },
  };
};

export const setAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: SetAction<UserData>,
  config: Config
): PrivateAppState<UserData> => {
  console.warn(
    "`set` is expensive. Consider using a more atomic action instead."
  );

  if (typeof action.state === "object") {
    const newState = {
      ...state,
      ...action.state,
    };
    return {
      ...state,
      ...action.state,
      indexes: action.state.indexes ?? {
        nodes: generateNodeIndex(newState, config),
        zones: generateZonesIndex(newState),
      },
    };
  }

  return { ...state, ...action.state(state) };
};

export function reduce<UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: PuckAction,
  appStore: AppStore
): PrivateAppState<UserData> {
  console.log("reducing...");
  if (action.type === "set") {
    return setAction<UserData>(
      state,
      action as SetAction<UserData>,
      appStore.config
    );
  }

  if (action.type === "insert") {
    return insertAction(state, action, appStore.config);
  }

  if (action.type === "replace") {
    return replaceAction(state, action);
  }

  if (action.type === "duplicate") {
    const item = getItem(
      { index: action.sourceIndex, zone: action.sourceZone },
      state
    )!;

    // TODO this is inefficient, as it iterates twice (once for indexProps)
    const newItem = mapSlots(item, (subItem) => ({
      ...subItem,
      props: { ...subItem.props, id: generateId(subItem.type) },
    }));

    const [parentId, zone] = action.sourceZone.split(":");

    const stateWithItem: PrivateAppState = {
      ...state,
      indexes: {
        ...state.indexes,
        nodes: {
          ...state.indexes.nodes,
          [newItem.props.id]: createNodeData(
            {
              data: newItem,
              parentId,
              zone,
            },
            state.indexes.nodes
          ),
        },
      },
    };

    const deepIndexes = indexProps(stateWithItem, newItem);

    const dataWithRelatedDuplicated = duplicateRelatedZones<UserData>(
      item,
      state.data,
      newItem.props.id
    );

    return {
      ...state,
      // TODO traditional zones aren't duplicating
      data: updateContent(
        dataWithRelatedDuplicated,
        action.sourceZone,
        (content) => {
          return insert(content, action.sourceIndex + 1, newItem);
        }
      ),
      ui: {
        ...state.ui,
        itemSelector: {
          index: action.sourceIndex + 1,
          zone: action.sourceZone,
        },
      },
      indexes: {
        ...stateWithItem.indexes,
        zones: {
          ...stateWithItem.indexes.zones,
          ...deepIndexes.zones,
          [action.sourceZone]: {
            ...stateWithItem.indexes.zones[action.sourceZone],
            contentIds: insert(
              stateWithItem.indexes.zones[action.sourceZone].contentIds,
              action.sourceIndex + 1,
              newItem.props.id
            ),
          },
        },
        nodes: {
          ...stateWithItem.indexes.nodes,
          ...deepIndexes.nodes,
        },
      },
    };
  }

  if (action.type === "reorder") {
    return reorderAction(state, action);
  }

  if (action.type === "move") {
    if (
      action.sourceZone === action.destinationZone &&
      action.sourceIndex === action.destinationIndex
    ) {
      return state;
    }

    const item = getItem(
      { zone: action.sourceZone, index: action.sourceIndex },
      state
    );

    if (!item) return state;

    const dataWithRemoved = updateContent(
      state.data,
      action.sourceZone,
      (content) => remove(content, action.sourceIndex)
    );

    const zoneIndexWithRemoved = {
      ...state.indexes.zones,
      [action.sourceZone]: {
        ...state.indexes.zones[action.sourceZone],
        contentIds: remove(
          state.indexes.zones[action.sourceZone].contentIds,
          action.sourceIndex
        ),
      },
    };

    return {
      ...state,
      data: updateContent(dataWithRemoved, action.destinationZone, (content) =>
        insert(content, action.destinationIndex, item)
      ),
      indexes: {
        ...state.indexes,
        zones: {
          ...zoneIndexWithRemoved,
          [action.destinationZone]: {
            ...zoneIndexWithRemoved[action.destinationZone],
            contentIds: insert(
              zoneIndexWithRemoved[action.destinationZone]?.contentIds || [],
              action.destinationIndex,
              item.props.id
            ),
          },
        },
      },
    };
  }

  if (action.type === "remove") {
    const item = getItem({ index: action.index, zone: action.zone }, state)!;

    return {
      ...state,
      data: updateContent(
        removeRelatedZones(item, state.data),
        action.zone,
        (content) => remove(content, action.index)
      ),
      ui: {
        ...state.ui,
        itemSelector: null,
      },
      indexes: {
        ...state.indexes,
        ...deindexProps(state, item),
      },
    };
  }

  if (action.type === "registerZone") {
    if (zoneCache[action.zone]) {
      return {
        ...state,
        data: {
          ...state.data,
          zones: {
            ...state.data.zones,
            [action.zone]: zoneCache[action.zone],
          },
        },
        indexes: {
          ...state.indexes,
          zones: {
            ...state.indexes.zones,
            [action.zone]: {
              ...state.indexes.zones[action.zone],
              contentIds: zoneCache[action.zone].map((item) => item.props.id),
              type: "dropzone",
            },
          },
        },
      };
    }

    return { ...state, data: setupZone(state.data, action.zone) };
  }

  if (action.type === "unregisterZone") {
    const _zones = { ...(state.data.zones || {}) };
    const zoneIndex = { ...(state.indexes.zones || {}) };

    if (_zones[action.zone]) {
      zoneCache[action.zone] = _zones[action.zone];

      delete _zones[action.zone];
    }

    delete zoneIndex[action.zone];

    return {
      ...state,
      data: {
        ...state.data,
        zones: _zones,
      },
      indexes: {
        ...state.indexes,
        zones: zoneIndex,
      },
    };
  }

  if (action.type === "setData") {
    if (typeof action.data === "object") {
      const newState = {
        ...state,
        data: {
          ...state.data,
          ...action.data,
        },
      };

      console.warn(
        "`setData` is expensive. Consider using a more atomic action instead."
      );

      return {
        ...newState,
        indexes: {
          nodes: generateNodeIndex(state, appStore.config),
          zones: generateZonesIndex(state),
        },
      };
    }

    return {
      ...state,
      data: {
        ...state.data,
        ...action.data(state.data),
      },
    };
  }

  if (action.type === "setUi") {
    if (typeof action.ui === "object") {
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.ui,
        },
      };
    }

    return {
      ...state,
      ui: {
        ...state.ui,
        ...action.ui(state.ui),
      },
    };
  }

  return state;
}
