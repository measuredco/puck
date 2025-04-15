import { Config, Content, Data } from "../types";
import { reorder } from "../lib/reorder";
import { insert } from "../lib/insert";
import { remove } from "../lib/remove";
import { setupZone } from "../lib/setup-zone";
import { getItem } from "../lib/get-item";
import { generateId } from "../lib/generate-id";
import {
  InsertAction,
  MoveAction,
  PuckAction,
  RemoveAction,
  ReorderAction,
  ReplaceAction,
  SetAction,
} from "./actions";
import {} from "./actions";
import { AppStore } from "../store";
import { PrivateAppState } from "../types/Internal";
import { walkTree } from "../lib/walk-tree";
import { deindex } from "../lib/deindex";

// Restore unregistered zones when re-registering in same session
export const zoneCache: Record<string, Content> = {};

export const addToZoneCache = (key: string, data: Content) => {
  zoneCache[key] = data;
};

const getIdsForParent = (zoneCompound: string, state: PrivateAppState) => {
  const [parentId] = zoneCompound.split(":");
  const node = state.indexes.nodes[parentId];

  return (node?.path || []).map((p) => p.split(":")[0]);
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

  const [parentId] = action.destinationZone.split(":");
  const idsInPath = getIdsForParent(action.destinationZone, state);

  return walkTree<UserData>(
    state,
    config,
    (content, zoneCompound) => {
      if (zoneCompound === action.destinationZone) {
        return insert(
          content || [],
          action.destinationIndex,
          emptyComponentData
        );
      }

      return content;
    },
    (childItem, path) => {
      if (childItem.props.id === id || childItem.props.id === parentId) {
        return childItem;
      } else if (idsInPath.includes(childItem.props.id)) {
        return childItem;
      } else if (path.includes(action.destinationZone)) {
        return childItem;
      }

      return null;
    }
  );
}

const moveAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: MoveAction,
  appStore: AppStore
): PrivateAppState<UserData> => {
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

  const idsInSourcePath = getIdsForParent(action.sourceZone, state);
  const idsInDestinationPath = getIdsForParent(action.destinationZone, state);

  return walkTree<UserData>(
    state,
    appStore.config,
    (content, zoneCompound) => {
      if (
        zoneCompound === action.sourceZone &&
        zoneCompound === action.destinationZone
      ) {
        return insert(
          remove(content, action.sourceIndex),
          action.destinationIndex,
          item
        );
      } else if (zoneCompound === action.sourceZone) {
        return remove(content, action.sourceIndex);
      } else if (zoneCompound === action.destinationZone) {
        return insert(content, action.destinationIndex, item);
      }

      return content;
    },
    (childItem, path) => {
      const [sourceZoneParent] = action.sourceZone.split(":");
      const [destinationZoneParent] = action.destinationZone.split(":");

      const childId = childItem.props.id;

      if (
        sourceZoneParent === childId ||
        destinationZoneParent === childId ||
        item.props.id === childId ||
        idsInSourcePath.indexOf(childId) > -1 ||
        idsInDestinationPath.indexOf(childId) > -1 ||
        path.includes(action.destinationZone)
      ) {
        return childItem;
      }

      return null;
    }
  );
};

export const replaceAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: ReplaceAction<UserData>,
  appStore: AppStore
): PrivateAppState<UserData> => {
  const [parentId] = action.destinationZone.split(":");
  const idsInPath = getIdsForParent(action.destinationZone, state);

  const originalId =
    state.indexes.zones[action.destinationZone].contentIds[
      action.destinationIndex
    ];

  const idChanged = originalId !== action.data.props.id;

  if (idChanged) {
    throw new Error(
      'Can\'t change the id during a replace action. Please us "remove" and "insert" to define a new node.'
    );
  }

  return walkTree<UserData>(
    state,
    appStore.config,
    (content, zoneCompound) => {
      const newContent = [...content];

      if (zoneCompound === action.destinationZone) {
        newContent[action.destinationIndex] = action.data;
      }

      return newContent;
    },
    (childItem, path) => {
      const pathIds = path.map((p) => p.split(":")[0]);

      if (childItem.props.id === action.data.props.id) {
        return action.data;
      } else if (childItem.props.id === parentId) {
        return childItem;
      } else if (idsInPath.indexOf(childItem.props.id) > -1) {
        // Node is parent of target
        return childItem;
      } else if (pathIds.indexOf(action.data.props.id) > -1) {
        // Node is child target
        return childItem;
      }

      return null;
    }
  );
};

export const setAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: SetAction<UserData>,
  appStore: AppStore
): PrivateAppState<UserData> => {
  if (typeof action.state === "object") {
    const newState = {
      ...state,
      ...action.state,
    };

    if (action.state.indexes) {
      console.warn(
        "`set` is expensive and may cause unnecessary re-renders. Consider using a more atomic action instead."
      );

      return newState;
    }

    return walkTree(newState, appStore.config);
  }

  return { ...state, ...action.state(state) };
};

const removeAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: RemoveAction,
  appStore: AppStore
) => {
  const item = getItem({ index: action.index, zone: action.zone }, state)!;

  // Cleaner to handle here than in walkTree
  let deindexed = deindex(state, item);

  const [parentId] = action.zone.split(":");

  return walkTree<UserData>(
    { ...state, indexes: deindexed },
    appStore.config,
    (content, zoneCompound) => {
      if (zoneCompound === action.zone) {
        return remove(content, action.index);
      }

      return content;
    },
    (childItem, path) => {
      const parentIds = path.map((p) => p.split(":")[0]);

      if (
        childItem.props.id === parentId ||
        childItem.props.id === item.props.id ||
        parentIds.indexOf(item.props.id) > -1
      ) {
        return childItem;
      }

      return null;
    }
  );
};

export function reduce<UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: PuckAction,
  appStore: AppStore
): PrivateAppState<UserData> {
  if (action.type === "set") {
    return setAction<UserData>(state, action as SetAction<UserData>, appStore);
  }

  if (action.type === "insert") {
    return insertAction(state, action, appStore.config);
  }

  if (action.type === "replace") {
    return replaceAction(state, action, appStore);
  }

  if (action.type === "replaceRoot") {
    return walkTree<UserData>(
      state,
      appStore.config,
      (content) => content,
      (childItem) => {
        if (childItem.props.id === "root") {
          return {
            ...childItem,
            props: { ...childItem.props, ...action.root.props },
            readOnly: action.root.readOnly,
          };
        }

        // Everything in inside root, so everything needs re-indexing
        return childItem;
      }
    );
  }

  if (action.type === "duplicate") {
    const item = getItem(
      { index: action.sourceIndex, zone: action.sourceZone },
      state
    )!;

    const idsInPath = getIdsForParent(action.sourceZone, state);

    const newItem = {
      ...item,
      props: {
        ...item.props,
        id: generateId(item.type),
      },
    };

    const modified = walkTree<UserData>(
      state,
      appStore.config,
      (content, zoneCompound) => {
        if (zoneCompound === action.sourceZone) {
          return insert(content, action.sourceIndex + 1, item);
        }

        return content;
      },
      (childItem, path, index) => {
        const zoneCompound = path[path.length - 1];

        const parents = path.map((p) => p.split(":")[0]);

        if (parents.indexOf(newItem.props.id) > -1) {
          return {
            ...childItem,
            props: {
              ...childItem.props,
              id: generateId(childItem.type),
            },
          };
        }

        if (
          zoneCompound === action.sourceZone &&
          index === action.sourceIndex + 1
        ) {
          return newItem;
        }

        const [sourceZoneParent] = action.sourceZone.split(":");

        if (
          sourceZoneParent === childItem.props.id ||
          idsInPath.indexOf(childItem.props.id) > -1
        ) {
          return childItem;
        }

        return null;
      }
    );

    return {
      ...modified,
      ui: {
        ...modified.ui,
        itemSelector: {
          index: action.sourceIndex + 1,
          zone: action.sourceZone,
        },
      },
    };
  }

  if (action.type === "reorder") {
    return moveAction(
      state,
      {
        type: "move",
        sourceIndex: action.sourceIndex,
        sourceZone: action.destinationZone,
        destinationIndex: action.destinationIndex,
        destinationZone: action.destinationZone,
      },
      appStore
    );
  }

  if (action.type === "move") {
    return moveAction(state, action, appStore);
  }

  if (action.type === "remove") {
    return removeAction(state, action, appStore);
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
      console.warn(
        "`setData` is expensive and may cause unnecessary re-renders. Consider using a more atomic action instead."
      );

      return walkTree(
        {
          ...state,
          data: {
            ...state.data,
            ...action.data,
          },
        },
        appStore.config
      );
    }

    return walkTree(
      {
        ...state,
        data: {
          ...state.data,
          ...action.data(state.data),
        },
      },
      appStore.config
    );
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
