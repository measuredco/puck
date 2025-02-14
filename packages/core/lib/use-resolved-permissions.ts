import { useCallback, useEffect, useState } from "react";
import { flattenData } from "./flatten-data";
import { ComponentData, Config, Permissions, UserGenerics } from "../types";
import { getChanged } from "./get-changed";
import { create } from "zustand";
import { getAppStore, useAppStore } from "../components/Puck/context";

type PermissionsArgs<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
> = {
  item?: G["UserComponentData"] | null;
  type?: keyof G["UserProps"];
  root?: boolean;
};

export type GetPermissions<UserConfig extends Config = Config> = (
  params?: PermissionsArgs<UserConfig>
) => Partial<Permissions>;

type ResolvePermissions<UserConfig extends Config = Config> = (
  params?: PermissionsArgs<UserConfig>,
  force?: boolean
) => void;

export type RefreshPermissions<UserConfig extends Config = Config> = (
  params?: PermissionsArgs<UserConfig>,
  force?: boolean
) => void;

type Cache = Record<
  string,
  {
    lastPermissions: Partial<Permissions>;
    lastData: ComponentData | null;
  }
>;

const usePermissionsStore = create<{
  // cache: Cache;
  globalPermissions: Permissions;
  getPermissions: GetPermissions<Config>;
}>((s) => ({
  globalPermissions: {},
  // getPermissions: ({ item, type, root } = {}) => {
  //   const { config } = getAppStore();

  //   if (item) {
  //     const componentConfig = config.components[item.type];

  //     const initialPermissions = {
  //       ...globalPermissions,
  //       ...componentConfig?.permissions,
  //     };

  //     const resolvedForItem = resolvedPermissions[item.props.id];

  //     return resolvedForItem
  //       ? { ...globalPermissions, ...resolvedForItem }
  //       : initialPermissions;
  //   } else if (type) {
  //     const componentConfig = config.components[type];

  //     return {
  //       ...globalPermissions,
  //       ...componentConfig?.permissions,
  //     };
  //   } else if (root) {
  //     const rootConfig = config.root;

  //     const initialPermissions = {
  //       ...globalPermissions,
  //       ...rootConfig?.permissions,
  //     };

  //     const resolvedForItem = resolvedPermissions["puck-root"];

  //     return resolvedForItem
  //       ? { ...globalPermissions, ...resolvedForItem }
  //       : initialPermissions;
  //   }

  //   return globalPermissions;
  // },
}));

export const useResolvedPermissions = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  globalPermissions: Partial<Permissions>,
  setComponentLoading?: (id: string) => void,
  unsetComponentLoading?: (id: string) => void
) => {
  const [cache, setCache] = useState<Cache>({});

  const [resolvedPermissions, setResolvedPermissions] = useState<
    Record<string, Partial<Permissions>>
  >({});

  const resolveDataForItem = useCallback(
    async (item: G["UserComponentData"], force: boolean = false) => {
      const { config, state: appState } = getAppStore<UserConfig>();
      const componentConfig =
        item.type === "root" ? config.root : config.components[item.type];

      if (!componentConfig) {
        return;
      }

      const initialPermissions = {
        ...globalPermissions,
        ...componentConfig.permissions,
      };

      if (componentConfig.resolvePermissions) {
        const changed = getChanged(item, cache[item.props.id]?.lastData);

        if (Object.values(changed).some((el) => el === true) || force) {
          setComponentLoading?.(item.props.id);

          const resolvedPermissions = await componentConfig.resolvePermissions(
            item,
            {
              changed,
              lastPermissions: cache[item.props.id]?.lastPermissions || null,
              permissions: initialPermissions,
              appState,
              lastData: cache[item.props.id]?.lastData || null,
            }
          );

          setCache((_cache) => ({
            ..._cache,
            [item.props.id]: {
              lastData: item,
              lastPermissions: resolvedPermissions,
            },
          }));

          setResolvedPermissions((p) => ({
            ...p,
            [item.props.id]: resolvedPermissions,
          }));

          unsetComponentLoading?.(item.props.id);
        }
      }
    },
    [globalPermissions, cache]
  );

  const resolveDataForRoot = (force = false) => {
    const { state: appState } = getAppStore<UserConfig>();

    resolveDataForItem(
      // Shim the root data in by conforming to component data shape
      {
        type: "root",
        props: { ...appState.data.root.props, id: "puck-root" },
      } as G["UserComponentData"],
      force
    );
  };

  const resolvePermissions = useCallback<ResolvePermissions<UserConfig>>(
    async ({ item, type, root } = {}, force = false) => {
      const { state } = getAppStore<UserConfig>();

      if (item) {
        // Resolve specific item
        await resolveDataForItem(item, force);
      } else if (type) {
        // Resolve specific type
        flattenData<UserConfig>(state.data)
          .filter((item) => item.type === type)
          .map(async (item) => {
            await resolveDataForItem(item, force);
          });
      } else if (root) {
        resolveDataForRoot(force);
      } else {
        resolveDataForRoot(force);

        // Resolve everything
        flattenData<UserConfig>(state.data).map(async (item) => {
          await resolveDataForItem(item, force);
        });
      }
    },
    []
  );

  const refreshPermissions = useCallback<ResolvePermissions<UserConfig>>(
    async (params) => {
      resolvePermissions(params, true);
    },
    []
  );

  // useEffect(() => {
  //   resolvePermissions();

  //   // We only trigger this effect on appState.data to avoid triggering on all UI changes
  // }, [config, appState.data]);

  const getPermissions: GetPermissions = useCallback(
    ({ item, type, root } = {}) => {
      const { config } = getAppStore<UserConfig>();

      if (item) {
        const componentConfig = config.components[item.type];

        const initialPermissions = {
          ...globalPermissions,
          ...componentConfig?.permissions,
        };

        const resolvedForItem = resolvedPermissions[item.props.id];

        return resolvedForItem
          ? { ...globalPermissions, ...resolvedForItem }
          : initialPermissions;
      } else if (type) {
        const componentConfig = config.components[type];

        return {
          ...globalPermissions,
          ...componentConfig?.permissions,
        };
      } else if (root) {
        const rootConfig = config.root;

        const initialPermissions = {
          ...globalPermissions,
          ...rootConfig?.permissions,
        };

        const resolvedForItem = resolvedPermissions["puck-root"];

        return resolvedForItem
          ? { ...globalPermissions, ...resolvedForItem }
          : initialPermissions;
      }

      return globalPermissions;
    },
    [resolvedPermissions]
  );

  return {
    getPermissions,
    refreshPermissions,
  };
};
