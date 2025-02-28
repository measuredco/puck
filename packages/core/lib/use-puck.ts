import { useShallow } from "zustand/react/shallow";
import { useAppStore, useAppStoreApi } from "../store";
import { Config, UserGenerics } from "../types";
import { useCallback } from "react";
import {
  GetPermissions,
  RefreshPermissions,
} from "../store/slices/permissions";

export const usePuck = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>() => {
  const appState = useAppStore<G["UserAppState"]>(
    (s) => s.state as G["UserAppState"]
  );
  const config = useAppStore<G["UserConfig"]>(
    (s) => s.config as G["UserConfig"]
  );
  const dispatch = useAppStore((s) => s.dispatch);
  const currentItem = useAppStore<G["UserComponentData"]>(
    (s) => s.selectedItem as G["UserComponentData"]
  );

  const appStore = useAppStoreApi();

  const historyApi = useAppStore(
    useShallow((s) => ({
      back: s.history.back,
      forward: s.history.forward,
      setHistories: s.history.setHistories,
      setHistoryIndex: s.history.setHistoryIndex,
      hasPast: s.history.hasPast(),
      hasFuture: s.history.hasFuture(),
      histories: s.history.histories,
      index: s.history.index,
    }))
  );

  const resolvedPermissions = useAppStore(
    (s) => s.permissions.resolvedPermissions
  );

  const getPermissions: GetPermissions<UserConfig> = useCallback(
    (params) => appStore.getState().permissions.getPermissions(params as any),
    [resolvedPermissions]
  );

  const refreshPermissions: RefreshPermissions<UserConfig> = useCallback(
    (params) =>
      appStore.getState().permissions.resolvePermissions(params as any),
    []
  );

  // TODO reimplement this.
  if (dispatch === defaultAppStore.dispatch) {
    throw new Error(
      "usePuck was used outside of the <Puck> component. The usePuck hook must be rendered within the <Puck> context as children, overrides or plugins as described in https://puckeditor.com/docs/api-reference/functions/use-puck."
    );
  }

  return {
    appState,
    config,
    dispatch,
    getPermissions,
    refreshPermissions,
    history: historyApi,
    selectedItem: currentItem || null,
  };
};
