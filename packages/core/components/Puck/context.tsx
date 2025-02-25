import {
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Config,
  IframeConfig,
  Overrides,
  Permissions,
  AppState,
  UiState,
  Plugin,
  UserGenerics,
  Metadata,
} from "../../types";
import { PuckAction } from "../../reducer";
import { getItem } from "../../lib/get-item";
import { PuckHistory } from "../../lib/use-puck-history";
import { defaultViewports } from "../ViewportControls/default-viewports";
import { Viewports } from "../../types";
import {
  GetPermissions,
  RefreshPermissions,
  useResolvedPermissions,
} from "../../lib/use-resolved-permissions";
import { useResolvedData } from "../../lib/use-resolved-data";

export const defaultAppState: AppState = {
  data: { content: [], root: {} },
  ui: {
    leftSideBarVisible: true,
    rightSideBarVisible: true,
    arrayState: {},
    itemSelector: null,
    componentList: {},
    isDragging: false,
    previewMode: "edit",
    viewports: {
      current: {
        width: defaultViewports[0].width,
        height: defaultViewports[0].height || "auto",
      },
      options: [],
      controlsVisible: true,
    },
    field: { focus: null },
  },
};

export type Status = "LOADING" | "MOUNTED" | "READY";

type ZoomConfig = {
  autoZoom: number;
  rootHeight: number;
  zoom: number;
};

type ComponentState = Record<string, { loadingCount: number }>;

export type AppContext<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
> = {
  state: G["UserAppState"];
  dispatch: (action: PuckAction) => void;
  config: UserConfig;
  componentState: ComponentState;
  setComponentState: React.Dispatch<SetStateAction<ComponentState>>;
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
  globalPermissions?: Partial<Permissions>;
  selectedItem?: G["UserData"]["content"][0];
  getPermissions: GetPermissions<UserConfig>;
  refreshPermissions: RefreshPermissions<UserConfig>;
  metadata: Metadata;
};

export const defaultContext: AppContext = {
  state: defaultAppState,
  dispatch: () => null,
  config: { components: {} },
  componentState: {},
  setComponentState: () => {},
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
  globalPermissions: {},
  getPermissions: () => ({}),
  refreshPermissions: () => null,
  metadata: {},
};

export const appContext = createContext<AppContext>(defaultContext);

export const AppProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: Omit<
    AppContext,
    | "zoomConfig"
    | "setZoomConfig"
    | "status"
    | "setStatus"
    | "componentState"
    | "setComponentState"
    | "resolveData"
  >;
}) => {
  const [zoomConfig, setZoomConfig] = useState(defaultContext.zoomConfig);

  const [status, setStatus] = useState<Status>("LOADING");

  // App is ready when client has loaded, after initial render
  // This triggers DropZones to activate
  useEffect(() => {
    setStatus("MOUNTED");
  }, []);

  const selectedItem = value.state.ui.itemSelector
    ? getItem(value.state.ui.itemSelector, value.state.data)
    : undefined;

  const [componentState, setComponentState] = useState<
    AppContext["componentState"]
  >({});

  const setComponentLoading = (id: string) => {
    setComponentState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        loadingCount: (prev[id]?.loadingCount || 0) + 1,
      },
    }));
  };

  const unsetComponentLoading = (id: string) => {
    setComponentState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        loadingCount: Math.max((prev[id]?.loadingCount || 0) - 1, 0),
      },
    }));
  };

  const { getPermissions, refreshPermissions } = useResolvedPermissions(
    value.config,
    value.state,
    value.globalPermissions || {},
    setComponentLoading,
    unsetComponentLoading
  );

  const { resolveData } = useResolvedData(
    value.state,
    value.config,
    value.dispatch,
    setComponentLoading,
    unsetComponentLoading,
    refreshPermissions,
    value.metadata
  );

  return (
    <appContext.Provider
      value={{
        ...value,
        selectedItem,
        zoomConfig,
        setZoomConfig,
        status,
        setStatus,
        getPermissions,
        refreshPermissions,
        componentState,
        setComponentState,
        resolveData,
      }}
    >
      {children}
    </appContext.Provider>
  );
};

export function useAppContext<UserConfig extends Config = Config>() {
  const mainContext = useContext<AppContext<UserConfig>>(appContext as any);

  return {
    ...mainContext,
    // Helpers
    setUi: (ui: Partial<UiState>, recordHistory?: boolean) => {
      return mainContext.dispatch({
        type: "setUi",
        ui,
        recordHistory,
      });
    },
  };
}
