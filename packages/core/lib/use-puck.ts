import { useAppContext } from "../components/Puck/context";
import { ComponentData } from "../types/Config";

export const usePuck = () => {
  const {
    state: appState,
    config,
    history,
    dispatch,
    selectedItem,
  } = useAppContext();

  const getPermission = ({
    permission,
    selectedItem,
  }: {
    permission: string;
    selectedItem: ComponentData;
  }) => {
    return config.components[selectedItem.type].permissions?.[permission] !==
      undefined
      ? config.components[selectedItem.type].permissions?.[permission]
      : null;
  };

  return {
    appState,
    config,
    dispatch,
    getPermission,
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
