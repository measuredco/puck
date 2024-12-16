import { defaultContext, useAppContext } from "../components/Puck/context";
import { Config, UserGenerics } from "../types";

export const usePuck = <UserConfig extends Config = Config>() => {
  const {
    state: appState,
    config,
    history,
    dispatch,
    selectedItem: currentItem,
    getPermissions,
    refreshPermissions,
  } = useAppContext<UserConfig>();

  if (dispatch === defaultContext.dispatch) {
    throw new Error(
      "usePuck was used outside of the <Puck> component. The usePuck hook must be rendered within the <Puck> context as children, overrides or plugins as described in https://puckeditor.com/docs/api-reference/functions/use-puck."
    );
  }

  return {
    appState,
    config,
    dispatch,
    getPermissions,
    refreshPermissions,
    history: {
      back: history.back!,
      forward: history.forward!,
      setHistories: history.setHistories!,
      setHistoryIndex: history.setHistoryIndex!,
      hasPast: history.historyStore!.hasPast,
      hasFuture: history.historyStore!.hasFuture,
      histories: history.historyStore!.histories,
      index: history.historyStore!.index,
      historyStore: history.historyStore,
    },
    selectedItem: currentItem || null,
  };
};
