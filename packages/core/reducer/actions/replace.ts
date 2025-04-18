import { Data } from "../../types";
import { ReplaceAction } from "../actions";
import { AppStore } from "../../store";
import { PrivateAppState } from "../../types/Internal";
import { walkTree } from "../../lib/data/walk-tree";
import { getIdsForParent } from "../../lib/data/get-ids-for-parent";

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
