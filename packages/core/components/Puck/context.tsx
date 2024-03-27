import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState, Config, UiState } from "../../types/Config";
import { PuckAction } from "../../reducer";
import { getItem } from "../../lib/get-item";
import { Plugin } from "../../types/Plugin";
import { Overrides } from "../../types/Overrides";
import { PuckHistory } from "../../lib/use-puck-history";
import { defaultViewports } from "../ViewportControls/default-viewports";
import { Viewports } from "../../types/Viewports";
import { IframeConfig } from "../../types/IframeConfig";

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
      },
      options: [],
      controlsVisible: true,
    },
  },
};

export type Status = "LOADING" | "MOUNTED" | "READY";

type ZoomConfig = {
  autoZoom: number;
  rootHeight: number;
  zoom: number;
};

type AppContext<UserConfig extends Config = Config> = {
  state: AppState;
  dispatch: (action: PuckAction) => void;
  config: UserConfig;
  componentState: Record<string, { loading: boolean }>;
  resolveData: (newAppState: AppState) => void;
  plugins: Plugin[];
  overrides: Partial<Overrides>;
  history: Partial<PuckHistory>;
  viewports: Viewports;
  zoomConfig: ZoomConfig;
  setZoomConfig: (zoomConfig: ZoomConfig) => void;
  status: Status;
  setStatus: (status: Status) => void;
  iframe: IframeConfig;
};

const defaultContext: AppContext = {
  state: defaultAppState,
  dispatch: () => null,
  config: { components: {} },
  componentState: {},
  resolveData: () => {},
  plugins: [],
  overrides: {},
  history: {},
  viewports: defaultViewports,
  zoomConfig: {
    autoZoom: 1,
    rootHeight: 0,
    zoom: 1,
  },
  setZoomConfig: () => null,
  status: "LOADING",
  setStatus: () => null,
  iframe: {},
};

export const appContext = createContext<AppContext>(defaultContext);

export const AppProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: Omit<
    AppContext,
    "zoomConfig" | "setZoomConfig" | "status" | "setStatus"
  >;
}) => {
  const [zoomConfig, setZoomConfig] = useState(defaultContext.zoomConfig);

  const [status, setStatus] = useState<Status>("LOADING");

  // App is ready when client has loaded, after initial render
  // This triggers DropZones to activate
  useEffect(() => {
    setStatus("MOUNTED");
  }, []);

  return (
    <appContext.Provider
      value={{ ...value, zoomConfig, setZoomConfig, status, setStatus }}
    >
      {children}
    </appContext.Provider>
  );
};

export function useAppContext<UserConfig extends Config = Config>() {
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
