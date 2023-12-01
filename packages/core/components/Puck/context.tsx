import { createContext, useContext } from "react";
import { AppState, Config, UiState } from "../../types/Config";
import { PuckAction } from "../../reducer";
import { getItem } from "../../lib/get-item";
import { Plugin } from "../../types/Plugin";
import { CustomUi } from "../../types/CustomUi";

export const defaultAppState: AppState = {
  data: { content: [], root: { props: { title: "" } } },
  ui: {
    leftSideBarVisible: true,
    rightSideBarVisible: true,
    arrayState: {},
    itemSelector: null,
    componentList: {},
    isDragging: false,
  },
};

type AppContext = {
  state: AppState;
  dispatch: (action: PuckAction) => void;
  config: Config;
  componentState: Record<string, { loading: boolean }>;
  resolveData: (newAppState: AppState) => void;
  plugins: Plugin[];
  customUi: Partial<CustomUi>;
};

export const appContext = createContext<AppContext>({
  state: defaultAppState,
  dispatch: () => null,
  config: { components: {} },
  componentState: {},
  resolveData: () => {},
  plugins: [],
  customUi: {},
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
