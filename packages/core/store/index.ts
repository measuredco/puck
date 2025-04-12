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
  ComponentData,
  RootDataWithProps,
} from "../types";
import { createReducer, PuckAction } from "../reducer";
import { getItem } from "../lib/get-item";
import { defaultViewports } from "../components/ViewportControls/default-viewports";
import { Viewports } from "../types";
import { create, StoreApi, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createContext, useContext } from "react";
import { createHistorySlice, type HistorySlice } from "./slices/history";
import { createNodesSlice, type NodesSlice } from "./slices/nodes";
import {
  createPermissionsSlice,
  type PermissionsSlice,
} from "./slices/permissions";
import { createFieldsSlice, type FieldsSlice } from "./slices/fields";
import { PrivateAppState } from "../types/Internal";
import { resolveComponentData } from "../lib/resolve-component-data";
import { walkTree } from "../lib/walk-tree";
import { toRoot } from "../lib/to-root";

export const defaultAppState: PrivateAppState = {
  data: { content: [], root: {}, zones: {} },
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
  indexes: {
    nodes: {},
    zones: {},
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
  setComponentLoading: (id: string, loading?: boolean, defer?: number) => void;
  unsetComponentLoading: (id: string) => void;
  pendingComponentLoads: Record<string, NodeJS.Timeout>;
  resolveComponentData: <T extends ComponentData | RootDataWithProps>(
    componentData: T
  ) => Promise<T>;
  resolveAndCommitData: () => void;
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
  onAction?: (action: PuckAction, newState: AppState, state: AppState) => void;
  metadata: Metadata;
  fields: FieldsSlice;
  history: HistorySlice;
  nodes: NodesSlice;
  permissions: PermissionsSlice;
};

export type AppStoreApi = StoreApi<AppStore>;

const defaultPageFields: Record<string, Field> = {
  title: { type: "text" },
};

export const createAppStore = (initialAppStore?: Partial<AppStore>) =>
  create<AppStore>()(
    subscribeWithSelector((set, get) => ({
      state: defaultAppState,
      config: { components: {} },
      componentState: {},
      plugins: [],
      overrides: {},
      viewports: defaultViewports,
      zoomConfig: {
        autoZoom: 1,
        rootHeight: 0,
        zoom: 1,
      },
      status: "LOADING",
      iframe: {},
      metadata: {},
      ...initialAppStore,
      fields: createFieldsSlice(set, get),
      history: createHistorySlice(set, get),
      nodes: createNodesSlice(set, get),
      permissions: createPermissionsSlice(set, get),
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
          const { record } = get().history;

          const dispatch = createReducer({
            config: s.config,
            record,
            appStore: s,
          });

          const state = dispatch(s.state, action);

          const selectedItem = state.ui.itemSelector
            ? getItem(state.ui.itemSelector, state)
            : null;

          get().onAction?.(action, state, get().state);

          return { ...s, state, selectedItem };
        }),
      setZoomConfig: (zoomConfig) => set({ zoomConfig }),
      setStatus: (status) => set({ status }),
      setComponentState: (componentState) => set({ componentState }),
      pendingComponentLoads: {},
      setComponentLoading: (
        id: string,
        loading: boolean = true,
        defer: number = 0
      ) => {
        const { setComponentState, pendingComponentLoads } = get();

        const thisPendingComponentLoads = { ...pendingComponentLoads };

        const setLoading = () => {
          const { componentState } = get();

          setComponentState({
            ...componentState,
            [id]: {
              ...componentState[id],
              loadingCount: (componentState[id]?.loadingCount || 0) + 1,
            },
          });
        };

        const unsetLoading = () => {
          const { componentState } = get();

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
        };

        if (thisPendingComponentLoads[id]) {
          clearTimeout(thisPendingComponentLoads[id]);

          delete thisPendingComponentLoads[id];

          set({ pendingComponentLoads: thisPendingComponentLoads });
        }

        const timeout = setTimeout(() => {
          if (loading) {
            setLoading();
          } else {
            unsetLoading();
          }

          delete thisPendingComponentLoads[id];

          set({ pendingComponentLoads: thisPendingComponentLoads });
        }, defer);

        set({
          pendingComponentLoads: {
            ...thisPendingComponentLoads,
            [id]: timeout,
          },
        });
      },
      unsetComponentLoading: (id: string) => {
        const { setComponentLoading } = get();

        setComponentLoading(id, false);
      },
      // Helper
      setUi: (ui: Partial<UiState>, recordHistory?: boolean) =>
        set((s) => {
          const dispatch = createReducer({
            config: s.config,
            record: () => {},
            appStore: s,
          });

          const state = dispatch(s.state, {
            type: "setUi",
            ui,
            recordHistory,
          });

          const selectedItem = state.ui.itemSelector
            ? getItem(state.ui.itemSelector, state)
            : null;

          return { ...s, state, selectedItem };
        }),
      // resolveDataRuns: 0,
      // resolveData: (newAppState) =>
      //   set((s) => {
      //     resolveData(newAppState, get);

      //     return { ...s, resolveDataRuns: s.resolveDataRuns + 1 };
      //   }),
      resolveComponentData: async (componentData) => {
        const { config, metadata, setComponentLoading } = get();

        return await resolveComponentData(
          componentData,
          config,
          metadata,
          (item) =>
            setComponentLoading(
              "id" in item.props ? item.props.id : "root",
              true,
              50
            ),
          (item) =>
            setComponentLoading(
              "id" in item.props ? item.props.id : "root",
              false,
              0
            )
        );
      },
      resolveAndCommitData: async () => {
        const { state, dispatch, resolveComponentData } = get();

        walkTree(
          state,
          (content) => content,
          (childItem) => {
            resolveComponentData(childItem).then((resolved) => {
              const { state } = get();

              const node = state.indexes.nodes[resolved.props.id];

              // Ensure item hasn't been deleted in the mean time
              if (node) {
                if (resolved.props.id === "root") {
                  dispatch({ type: "replaceRoot", root: toRoot(resolved) });
                } else {
                  // Use latest position, in case it's moved
                  const zoneCompound = `${node.parentId}:${node.zone}`;
                  const parentZone = state.indexes.zones[zoneCompound];

                  const index = parentZone.contentIds.indexOf(
                    resolved.props.id
                  );

                  dispatch({
                    type: "replace",
                    data: resolved,
                    destinationIndex: index,
                    destinationZone: zoneCompound,
                  });
                }
              }
            });

            return childItem;
          }
        );
      },
    }))
  );

export const appStoreContext = createContext(createAppStore());

export function useAppStore<T>(selector: (state: AppStore) => T) {
  const context = useContext(appStoreContext);

  return useStore(context, selector);
}

export function useAppStoreApi() {
  return useContext(appStoreContext);
}
