import { useShallow } from "zustand/react/shallow";
import { defaultAppStore, useAppStore } from "../stores/app-store";
import { Config, UserGenerics } from "../types";
import { useHistoryStore } from "../stores/history-store";
import { useCallback } from "react";
import {
  GetPermissions,
  RefreshPermissions,
  usePermissionsStore,
} from "../stores/permissions-store";

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
  const currentItem = useAppStore((s) => s.selectedItem);

  const historyApi = useHistoryStore(
    useShallow((s) => ({
      back: s.back,
      forward: s.forward,
      setHistories: s.setHistories,
      setHistoryIndex: s.setHistoryIndex,
      hasPast: s.hasPast(),
      hasFuture: s.hasFuture(),
      histories: s.histories,
      index: s.index,
    }))
  );

  const resolvedPermissions = usePermissionsStore((s) => s.resolvedPermissions);

  const getPermissions: GetPermissions<UserConfig> = useCallback(
    (params) => usePermissionsStore.getState().getPermissions(params as any),
    [resolvedPermissions]
  );

  const refreshPermissions: RefreshPermissions<UserConfig> = useCallback(
    (params) =>
      usePermissionsStore.getState().resolvePermissions(params as any),
    []
  );

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
