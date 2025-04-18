import { Data } from "../../types";
import { remove } from "../../lib/remove";
import { getItem } from "../../lib/get-item";
import { RemoveAction } from "../actions";
import { AppStore } from "../../store";
import { PrivateAppState } from "../../types/Internal";
import { walkTree } from "../../lib/walk-tree";

export const removeAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: RemoveAction,
  appStore: AppStore
) => {
  const item = getItem({ index: action.index, zone: action.zone }, state)!;

  const [parentId] = action.zone.split(":");

  // Gather related
  const nodesToDelete = Object.entries(state.indexes.nodes).reduce<string[]>(
    (acc, [nodeId, nodeData]) => {
      const pathIds = nodeData.path.map((p) => p.split(":")[0]);
      if (pathIds.includes(item.props.id)) {
        return [...acc, nodeId];
      }

      return acc;
    },
    [item.props.id]
  );

  const newState = walkTree<UserData>(
    state,
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

  Object.keys(newState.data.zones || {}).forEach((zoneCompound) => {
    const parentId = zoneCompound.split(":")[0];

    if (nodesToDelete.includes(parentId) && newState.data.zones) {
      delete newState.data.zones[zoneCompound];
    }
  });

  Object.keys(newState.indexes.zones).forEach((zoneCompound) => {
    const parentId = zoneCompound.split(":")[0];

    if (nodesToDelete.includes(parentId)) {
      delete newState.indexes.zones[zoneCompound];
    }
  });

  nodesToDelete.forEach((id) => {
    delete newState.indexes.nodes[id];
  });

  return newState;
};
