import { Data } from "../../types";
import { ReplaceAction } from "../actions";
import { AppStore } from "../../store";
import { PrivateAppState } from "../../types/Internal";
import { walkAppState } from "../../lib/data/walk-app-state";
import { getIdsForParent } from "../../lib/data/get-ids-for-parent";
import { populateIds } from "../../lib/data/populate-ids";

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

  const data = populateIds(action.data, appStore.config);

  return walkAppState<UserData>(
    state,
    appStore.config,
    (content, zoneCompound) => {
      const newContent = [...content];

      if (zoneCompound === action.destinationZone) {
        newContent[action.destinationIndex] = data;
      }

      return newContent;
    },
    (childItem, path) => {
      const pathIds = path.map((p) => p.split(":")[0]);

      if (childItem.props.id === data.props.id) {
        return data;
      } else if (childItem.props.id === parentId) {
        return childItem;
      } else if (idsInPath.indexOf(childItem.props.id) > -1) {
        // Node is parent of target
        return childItem;
      } else if (pathIds.indexOf(data.props.id) > -1) {
        // Node is child target
        return childItem;
      }

      return null;
    }
  );
};
