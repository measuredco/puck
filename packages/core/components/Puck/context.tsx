import { createContext } from "react";
import {
  Config,
  IframeConfig,
  Overrides,
  Permissions,
  AppState,
  UiState,
  Plugin,
  UserGenerics,
  Field,
  ComponentConfig,
} from "../../types";
import { createReducer, PuckAction } from "../../reducer";
import { getItem } from "../../lib/get-item";
import { PuckHistory } from "../../lib/use-puck-history";
import { defaultViewports } from "../ViewportControls/default-viewports";
import { Viewports } from "../../types";
import {
  GetPermissions,
  RefreshPermissions,
} from "../../lib/use-resolved-permissions";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { resolveData } from "../../lib/resolve-data";

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
  setComponentState: (componentState: ComponentState) => void;
  setComponentLoading: (id: string) => void;
  unsetComponentLoading: (id: string) => void;
  resolveDataRuns: number;
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
  selectedItem?: G["UserData"]["content"][0] | null;
  setUi: (ui: Partial<UiState>, recordHistory?: boolean) => void;
  getComponentConfig: (type?: string) => ComponentConfig | null | undefined;
};

export const defaultContext: AppContext = {
  state: defaultAppState,
  dispatch: () => null,
  config: { components: {} },
  componentState: {},
  setComponentState: () => {},
  setComponentLoading: () => {},
  unsetComponentLoading: () => {},
  resolveDataRuns: 0,
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
  setUi: () => null,
  getComponentConfig: () => null,
};

export const appContext = createContext<AppContext>(defaultContext);

// export const AppProvider = ({
//   children,
//   value,
// }: {
//   children: ReactNode;
//   value: Omit<
//     AppContext,
//     | "zoomConfig"
//     | "setZoomConfig"
//     | "status"
//     | "setStatus"
//     | "componentState"
//     | "setComponentState"
//     | "resolveData"
//   >;
// }) => {
//   const [zoomConfig, setZoomConfig] = useState(defaultContext.zoomConfig);

//   const [status, setStatus] = useState<Status>("LOADING");

//   // App is ready when client has loaded, after initial render
//   // This triggers DropZones to activate
//   useEffect(() => {
//     setStatus("MOUNTED");
//   }, []);

//   const selectedItem = value.state.ui.itemSelector
//     ? getItem(value.state.ui.itemSelector, value.state.data)
//     : undefined;

//   const [componentState, setComponentState] = useState<
//     AppContext["componentState"]
//   >({});

//   const setComponentLoading = (id: string) => {
//     setComponentState((prev) => ({
//       ...prev,
//       [id]: {
//         ...prev[id],
//         loadingCount: (prev[id]?.loadingCount || 0) + 1,
//       },
//     }));
//   };

//   const unsetComponentLoading = (id: string) => {
//     setComponentState((prev) => ({
//       ...prev,
//       [id]: {
//         ...prev[id],
//         loadingCount: Math.max((prev[id]?.loadingCount || 0) - 1, 0),
//       },
//     }));
//   };

//   const { getPermissions, refreshPermissions } = useResolvedPermissions(
//     value.config,
//     value.state,
//     value.globalPermissions || {},
//     setComponentLoading,
//     unsetComponentLoading
//   );

//   const { resolveData } = useResolvedData(
//     value.state,
//     value.config,
//     value.dispatch,
//     setComponentLoading,
//     unsetComponentLoading,
//     refreshPermissions
//   );

//   return (
//     <appContext.Provider
//       value={{
//         ...value,
//         selectedItem,
//         zoomConfig,
//         setZoomConfig,
//         status,
//         setStatus,
//         getPermissions,
//         refreshPermissions,
//         componentState,
//         setComponentState,
//         resolveData,
//       }}
//     >
//       {children}
//     </appContext.Provider>
//   );
// };

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

export const useAppStore = create<AppContext>()(
  subscribeWithSelector((set, get) => ({
    ...defaultContext,
    getComponentConfig: (type?: string) => {
      const { config, selectedItem } = get();
      const rootFields = config.root?.fields || defaultPageFields;

      return type
        ? config.components[type]
        : selectedItem
        ? config.components[selectedItem.type]
        : ({ ...config.root, fields: rootFields } as ComponentConfig);
    },
    dispatch: (action: PuckAction) =>
      set((s) => {
        const dispatch = createReducer({ config: s.config, record: () => {} });

        const state = dispatch(s.state, action);

        const selectedItem = state.ui.itemSelector
          ? getItem(state.ui.itemSelector, state.data)
          : null;

        console.log("store dispatch", action);

        return { ...s, state, selectedItem };
      }),
    setZoomConfig: (zoomConfig) => set({ zoomConfig }),
    setStatus: (status) => set({ status }),
    setComponentState: (componentState) => set({ componentState }),
    setComponentLoading: (id: string) => {
      const { setComponentState, componentState } = get();

      setComponentState({
        ...componentState,
        [id]: {
          ...componentState[id],
          loadingCount: (componentState[id]?.loadingCount || 0) + 1,
        },
      });
    },
    unsetComponentLoading: (id: string) => {
      const { setComponentState, componentState } = get();

      setComponentState({
        ...componentState,
        [id]: {
          ...componentState[id],
          loadingCount: Math.max(
            (componentState[id]?.loadingCount || 0) - 1,
            0
          ),
        },
      });
    },
    // Helper
    setUi: (ui: Partial<UiState>, recordHistory?: boolean) =>
      set((s) => {
        const dispatch = createReducer({ config: s.config, record: () => {} });

        const state = dispatch(s.state, {
          type: "setUi",
          ui,
          recordHistory,
        });

        const selectedItem = state.ui.itemSelector
          ? getItem(state.ui.itemSelector, state.data)
          : null;

        return { ...s, state, selectedItem };
      }),
    resolveDataRuns: 0,
    resolveData: (newAppState) =>
      set((s) => {
        resolveData(newAppState);

        return { ...s, resolveDataRuns: s.resolveDataRuns + 1 };
      }),
  }))
);

export function getAppStore<UserConfig extends Config = Config>() {
  return useAppStore.getState() as unknown as AppContext<UserConfig>;
}

export function useAppContext<UserConfig extends Config = Config>() {
  // const mainContext = useContext<AppContext<UserConfig>>(appContext as any);
  const store = useAppStore() as unknown as AppContext<UserConfig>;

  return {
    ...store,
  };
}
