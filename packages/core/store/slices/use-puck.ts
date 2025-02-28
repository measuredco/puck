import {
  ComponentData,
  Data,
  Config,
  UserGenerics,
  AppState,
} from "../../types";
import { useEffect } from "react";
import { AppStore, useAppStoreApi } from "../";
import { GetPermissions, RefreshPermissions } from "./permissions";
import { useShallow } from "zustand/react/shallow";
import { HistorySlice } from "./history";

export type UsePuckSlice<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
> = {
  appState: AppState;
  config: Config;
  dispatch: AppStore["dispatch"];
  getPermissions: GetPermissions<UserConfig>;
  refreshPermissions: RefreshPermissions<UserConfig>;
  selectedItem: G["UserComponentData"] | null;
  history: {
    back: HistorySlice["back"];
    forward: HistorySlice["forward"];
    setHistories: HistorySlice["setHistories"];
    setHistoryIndex: HistorySlice["setHistoryIndex"];
    histories: HistorySlice["histories"];
    index: HistorySlice["index"];
    hasPast: boolean;
    hasFuture: boolean;
  };
};

type PickedStore = Pick<
  AppStore,
  "state" | "config" | "dispatch" | "selectedItem" | "permissions" | "history"
>;

export const generateUsePuckSlice = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  get: () => PickedStore
): UsePuckSlice<UserConfig> => {
  console.log("store", store);
  const history: UsePuckSlice["history"] = {
    back: store.history.back,
    forward: store.history.forward,
    setHistories: store.history.setHistories,
    setHistoryIndex: store.history.setHistoryIndex,
    hasPast: store.history.hasPast(),
    hasFuture: store.history.hasFuture(),
    histories: store.history.histories,
    index: store.history.index,
  };

  const getPermissions: GetPermissions<UserConfig> = (params) =>
    get().permissions.getPermissions(params as any);

  const refreshPermissions: RefreshPermissions<UserConfig> = (params) =>
    get().permissions.resolvePermissions(params as any);

  const selectedItem = store.selectedItem as G["UserComponentData"];

  return {
    appState: store.state,
    config: store.config,
    dispatch: store.dispatch,
    getPermissions,
    refreshPermissions,
    history,
    selectedItem: selectedItem || null,
  };
};

export const createUsePuckSlice = <UserConfig extends Config = Config>(
  _set: (newState: Partial<AppStore>) => void,
  get: () => AppStore
): UsePuckSlice<UserConfig> => {
  return generateUsePuckSlice<UserConfig>(get);
};

/**
 * Reindex slice whenever the state changes
 */
export const useRegisterUsePuckSlice = (
  appStore: ReturnType<typeof useAppStoreApi>
) => {
  useEffect(
    appStore.subscribe(
      useShallow((store) => {
        const pickedStore: PickedStore = {
          state: store.state,
          config: store.config,
          dispatch: store.dispatch,
          permissions: store.permissions,
          history: store.history,
          selectedItem: store.selectedItem,
        };

        return pickedStore;
      }),
      (pickedStore) => {
        appStore.setState({ usePuck: generateUsePuckSlice(() => pickedStore) });
      }
    ),
    []
  );
};
