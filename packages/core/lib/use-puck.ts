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
    history,
    selectedItem: selectedItem || null,
  };
};
