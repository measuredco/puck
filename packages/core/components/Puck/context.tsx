import { createContext, useContext } from "react";
import { AppState, Config, UiState } from "../../types/Config";
import { PuckAction } from "../../reducer";
import { getItem } from "../../lib/get-item";

export const defaultAppState: AppState = {
  data: { content: [], root: { title: "" } },
  ui: {
    leftSideBarVisible: true,
    arrayState: {},
    itemSelector: null,
    componentList: {},
  },
};

type AppContext = {
  state: AppState;
  dispatch: (action: PuckAction) => void;
  config: Config;
  componentState: Record<string, { loading: true }>;
};

export const appContext = createContext<AppContext>({
  state: defaultAppState,
  dispatch: () => null,
  config: { components: {} },
  componentState: {},
});

export const AppProvider = appContext.Provider;

export const useAppContext = () => {
  const mainContext = useContext(appContext);

  const selectedItem = mainContext.state.ui.itemSelector
    ? getItem(mainContext.state.ui.itemSelector, mainContext.state.data)
    : undefined;

  return {
    ...mainContext,
    // Helpers
    selectedItem,
    setUi: (ui: Partial<UiState>, recordHistory?: boolean) => {
      return mainContext.dispatch({
        type: "setUi",
        ui,
        recordHistory,
      });
    },
  };
};
