import { useAppContext } from "../components/Puck/context";

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
    history: {
      back: history.back!,
      forward: history.forward!,
      hasPast: history.historyStore!.hasPast,
      hasFuture: history.historyStore!.hasFuture,
      histories: history.historyStore!.histories,
      index: history.historyStore!.index,
      historyStore: history.historyStore,
    },
    selectedItem: selectedItem || null,
  };
};
