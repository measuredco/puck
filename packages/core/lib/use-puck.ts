import { useAppContext } from "../components/Puck/context";
import { ComponentData, DefaultComponentProps } from "../types/Config";
import { getPermissions } from "./get-permissions";

export const usePuck = () => {
  const {
    state: appState,
    config,
    history,
    dispatch,
    selectedItem,
    globalPermissions,
  } = useAppContext();

  return {
    appState,
    config,
    dispatch,
    getPermissions: (componentType?: keyof DefaultComponentProps) => {
      return getPermissions({
        componentType:
          componentType || (selectedItem && selectedItem.type) || "",
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
    selectedItem: selectedItem || null,
  };
};
