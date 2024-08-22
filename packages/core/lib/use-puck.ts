import { useAppContext } from "../components/Puck/context";
import { ComponentData, DefaultComponentProps } from "../types/Config";
import { getPermissions } from "./get-permissions";

export const usePuck = () => {
  const {
    state: appState,
    config,
    history,
    dispatch,
    selectedItem: currentItem,
    globalPermissions,
  } = useAppContext();

  return {
    appState,
    config,
    dispatch,
    getPermissions: (
      selectedItem?: ComponentData,
      type?: keyof DefaultComponentProps
    ) => {
      return getPermissions({
        selectedItem: selectedItem || currentItem,
        type,
        globalPermissions: globalPermissions || {},
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
    selectedItem: currentItem || null,
  };
};
