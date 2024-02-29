import { createContext, useContext } from "react";
import { AppState, Config, UiState } from "../../types/Config";
import { PuckAction } from "../../reducer";
import { getItem } from "../../lib/get-item";
import { Plugin } from "../../types/Plugin";
import { Overrides } from "../../types/Overrides";
import { PuckHistory } from "../../lib/use-puck-history";
import { Viewports, defaultViewports } from "../ViewportControls";

export const defaultAppState: AppState = {
  data: { content: [], root: { props: { title: "" } } },
  ui: {
    leftSideBarVisible: true,
    rightSideBarVisible: true,
    arrayState: {},
    itemSelector: null,
    componentList: {},
    isDragging: false,
    viewports: {
      current: {
        width: defaultViewports[0].width,
        height: defaultViewports[0].height || "auto",
        zoom: 1,
      },
      options: [],
      controlsVisible: true,
    },
  },
};

type AppContext<
  UserConfig extends Config<any, any, any> = Config<any, any, any>
> = {
  state: AppState;
  dispatch: (action: PuckAction) => void;
  config: UserConfig;
  componentState: Record<string, { loading: boolean }>;
  resolveData: (newAppState: AppState) => void;
  plugins: Plugin[];
  overrides: Partial<Overrides>;
  history: Partial<PuckHistory>;
  viewports: Viewports;
};

export const appContext = createContext<AppContext>({
  state: defaultAppState,
  dispatch: () => null,
  config: { components: {} },
  componentState: {},
  resolveData: () => {},
  plugins: [],
  overrides: {},
  history: {},
  viewports: defaultViewports,
});

export const AppProvider = appContext.Provider;

export function useAppContext<
  UserConfig extends Config<any, any, any> = Config<any, any, any>
>() {
  const mainContext = useContext(appContext) as AppContext<UserConfig>;

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
}
