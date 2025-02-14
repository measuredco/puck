import {
  Config,
  IframeConfig,
  Overrides,
  AppState,
  UiState,
  Plugin,
  UserGenerics,
  Field,
  ComponentConfig,
  Metadata,
} from "../types";
import { createReducer, PuckAction } from "../reducer";
import { getItem } from "../lib/get-item";
import { defaultViewports } from "../components/ViewportControls/default-viewports";
import { Viewports } from "../types";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { resolveData } from "../lib/resolve-data";
import { useHistoryStore } from "./history-store";

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

export type AppStore<
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
  viewports: Viewports;
  zoomConfig: ZoomConfig;
  setZoomConfig: (zoomConfig: ZoomConfig) => void;
  status: Status;
  setStatus: (status: Status) => void;
  iframe: IframeConfig;
  selectedItem?: G["UserData"]["content"][0] | null;
  setUi: (ui: Partial<UiState>, recordHistory?: boolean) => void;
  getComponentConfig: (type?: string) => ComponentConfig | null | undefined;
  metadata: Metadata;
};

export const defaultAppStore: AppStore = {
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
  metadata: {},
};

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    ...defaultAppStore,
    getComponentConfig: (type?: string) => {
      const { config, selectedItem } = get();
      const rootFields = config.root?.fields || defaultPageFields;

      return type && type !== "root"
        ? config.components[type]
        : selectedItem
        ? config.components[selectedItem.type]
        : ({ ...config.root, fields: rootFields } as ComponentConfig);
    },
    dispatch: (action: PuckAction) =>
      set((s) => {
        const { record } = useHistoryStore.getState();

        const dispatch = createReducer({ config: s.config, record });

        const state = dispatch(s.state, action);

        const selectedItem = state.ui.itemSelector
          ? getItem(state.ui.itemSelector, state.data)
          : null;

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
  return useAppStore.getState() as unknown as AppStore<UserConfig>;
}
