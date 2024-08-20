import { useAppContext } from "../components/Puck/context";
import { ComponentData } from "../types/Config";
import { getPermissions } from "./get-permissions";

export const usePuck = () => {
  const {
    state: appState,
    config,
    history,
    dispatch,
    selectedItem,
  } = useAppContext();

  return {
    appState,
    config,
    dispatch,
    getPermissions: (permissions: string[]) => {
      return getPermissions({
        permissions,
        selectedItem,
        state: appState,
        config,
      });
    },
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
    selectedItem: selectedItem || null,
  };
};
