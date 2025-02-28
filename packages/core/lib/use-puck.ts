import { Config, UserGenerics, AppState } from "../types";
import { createContext, useContext, useEffect, useState } from "react";
import { AppStore, useAppStoreApi } from "../store";
import {
  GetPermissions,
  RefreshPermissions,
} from "../store/slices/permissions";
import { HistorySlice } from "../store/slices/history";
import { createStore, StoreApi, useStore } from "zustand";

type WithGet<T> = T & { get: () => T };

export type UsePuckData<
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

type UsePuckStore<UserConfig extends Config = Config> = WithGet<
  UsePuckData<UserConfig>
>;

type PickedStore = Pick<
  AppStore,
  "state" | "config" | "dispatch" | "selectedItem" | "permissions" | "history"
>;

export const generateUsePuck = (store: PickedStore): UsePuckStore => {
  const history: UsePuckStore["history"] = {
    back: store.history.back,
    forward: store.history.forward,
    setHistories: store.history.setHistories,
    setHistoryIndex: store.history.setHistoryIndex,
    hasPast: store.history.hasPast(),
    hasFuture: store.history.hasFuture(),
    histories: store.history.histories,
    index: store.history.index,
  };

  const storeData: UsePuckData = {
    appState: store.state,
    config: store.config,
    dispatch: store.dispatch,
    getPermissions: store.permissions.getPermissions,
    refreshPermissions: store.permissions.refreshPermissions,
    history,
    selectedItem: store.selectedItem || null,
  };

  const get = () => storeData;

  return { ...storeData, get };
};

export const UsePuckStoreContext = createContext<StoreApi<UsePuckStore> | null>(
  null
);

/**
 * Mirror changes in appStore to usePuckStore
 */
export const useRegisterUsePuckStore = (
  appStore: ReturnType<typeof useAppStoreApi>
) => {
  const [usePuckStore] = useState(() =>
    createStore(() => generateUsePuck(appStore.getState()))
  );

  useEffect(() => {
    // Subscribe here isn't doing anything as selection isn't shallow
    return appStore.subscribe(
      (store) => {
        const pickedStore: PickedStore = {
          state: store.state,
          config: store.config,
          dispatch: store.dispatch,
          permissions: store.permissions,
          history: store.history,
          selectedItem: store.selectedItem,
        };

        return pickedStore;
      },
      (pickedStore) => {
        usePuckStore.setState(generateUsePuck(pickedStore));
      }
    );
  }, []);

  return usePuckStore;
};

/**
 * createUsePuck
 *
 * Create a typed usePuck hook, which is necessary because the user may provide a generic type but not
 * a selector type, and TS does not currently support partial inference.
 * Related: https://github.com/microsoft/TypeScript/issues/26242
 *
 * @returns a typed usePuck function
 */
export function createUsePuck<UserConfig extends Config = Config>() {
  return function usePuck<T = UsePuckData<UserConfig>>(
    selector: (state: UsePuckStore<UserConfig>) => T
  ): T {
    const usePuckApi = useContext(UsePuckStoreContext);

    if (!usePuckApi) {
      throw new Error("usePuck must be used inside <Puck>.");
    }

    const result = useStore(
      usePuckApi as unknown as StoreApi<UsePuckStore<UserConfig>>,
      selector ?? ((s) => s as T)
    );

    return result;
  };
}

export function usePuck<UserConfig extends Config = Config>() {
  useEffect(() => {
    console.warn(
      "You're using the `usePuck` method without a selector, which may cause unnecessary re-renders. Replace with `createUsePuck` and provide a selector for improved performance."
    );
  }, []);

  return createUsePuck<UserConfig>()((s) => s);
}
