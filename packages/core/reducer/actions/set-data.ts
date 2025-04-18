import { Data } from "../../types";
import { SetDataAction } from "../actions";
import { AppStore } from "../../store";
import { PrivateAppState } from "../../types/Internal";
import { walkTree } from "../../lib/data/walk-tree";

export const setDataAction = <UserData extends Data>(
  state: PrivateAppState<UserData>,
  action: SetDataAction,
  appStore: AppStore
): PrivateAppState<UserData> => {
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
};
