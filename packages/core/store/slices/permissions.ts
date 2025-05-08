import { useEffect } from "react";
import { flattenData } from "../../lib/data/flatten-data";
import { ComponentData, Config, Permissions, UserGenerics } from "../../types";
import { getChanged } from "../../lib/get-changed";
import { AppStore, useAppStoreApi } from "../";
import { makeStatePublic } from "../../lib/data/make-state-public";

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
) => Permissions;

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

export type PermissionsSlice = {
  cache: Cache;
  globalPermissions: Permissions;
  resolvedPermissions: Record<string, Partial<Permissions> | undefined>;
  getPermissions: GetPermissions<Config>;
  resolvePermissions: ResolvePermissions<Config>;
  refreshPermissions: RefreshPermissions<Config>;
};

export const createPermissionsSlice = (
  set: (newState: Partial<AppStore>) => void,
  get: () => AppStore
): PermissionsSlice => {
  const resolvePermissions: ResolvePermissions = async (params = {}, force) => {
    const { state, permissions, config } = get();
    const { cache, globalPermissions } = permissions;

    const resolveDataForItem = async (
      item: ComponentData,
      force: boolean = false
    ) => {
      const { config, state: appState, setComponentLoading } = get();
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
          const clearTimeout = setComponentLoading(item.props.id, true, 50);

          const resolvedPermissions = await componentConfig.resolvePermissions(
            item,
            {
              changed,
              lastPermissions: cache[item.props.id]?.lastPermissions || null,
              permissions: initialPermissions,
              appState: makeStatePublic(appState),
              lastData: cache[item.props.id]?.lastData || null,
            }
          );

          const latest = get().permissions;

          set({
            permissions: {
              ...latest,
              cache: {
                ...latest.cache,
                [item.props.id]: {
                  lastData: item,
                  lastPermissions: resolvedPermissions,
                },
              },
              resolvedPermissions: {
                ...latest.resolvedPermissions,
                [item.props.id]: resolvedPermissions,
              },
            },
          });

          clearTimeout();
        }
      }
    };

    const resolveDataForRoot = (force = false) => {
      const { state: appState } = get();

      resolveDataForItem(
        // Shim the root data in by conforming to component data shape
        {
          type: "root",
          props: { ...appState.data.root.props, id: "root" },
        },
        force
      );
    };

    const { item, type, root } = params;

    if (item) {
      // Resolve specific item
      await resolveDataForItem(item, force);
    } else if (type) {
      // Resolve specific type
      flattenData(state, config)
        .filter((item) => item.type === type)
        .map(async (item) => {
          await resolveDataForItem(item, force);
        });
    } else if (root) {
      resolveDataForRoot(force);
    } else {
      // Resolve everything
      flattenData(state, config).map(async (item) => {
        await resolveDataForItem(item, force);
      });
    }
  };

  const refreshPermissions: RefreshPermissions = (params) =>
    resolvePermissions(params, true);

  return {
    cache: {},
    globalPermissions: {
      drag: true,
      edit: true,
      delete: true,
      duplicate: true,
      insert: true,
    },
    resolvedPermissions: {},
    getPermissions: ({ item, type, root } = {}) => {
      const { config, permissions } = get();
      const { globalPermissions, resolvedPermissions } = permissions;

      if (item) {
        const componentConfig = config.components[item.type];

        const initialPermissions = {
          ...globalPermissions,
          ...componentConfig?.permissions,
        };

        const resolvedForItem = resolvedPermissions[item.props.id];

        return (
          resolvedForItem
            ? { ...globalPermissions, ...resolvedForItem }
            : initialPermissions
        ) as Permissions;
      } else if (type) {
        const componentConfig = config.components[type];

        return {
          ...globalPermissions,
          ...componentConfig?.permissions,
        } as Permissions;
      } else if (root) {
        const rootConfig = config.root;

        const initialPermissions = {
          ...globalPermissions,
          ...rootConfig?.permissions,
        } as Permissions;

        const resolvedForItem = resolvedPermissions["root"];

        return (
          resolvedForItem
            ? { ...globalPermissions, ...resolvedForItem }
            : initialPermissions
        ) as Permissions;
      }

      return globalPermissions;
    },
    resolvePermissions,
    refreshPermissions,
  };
};

export const useRegisterPermissionsSlice = (
  appStore: ReturnType<typeof useAppStoreApi>,
  globalPermissions: Partial<Permissions>
) => {
  useEffect(() => {
    const { permissions } = appStore.getState();
    const { globalPermissions: existingGlobalPermissions } = permissions;
    appStore.setState({
      permissions: {
        ...permissions,
        globalPermissions: {
          ...existingGlobalPermissions,
          ...globalPermissions,
        } as Permissions,
      },
    });

    permissions.resolvePermissions();
  }, [globalPermissions]);

  useEffect(() => {
    return appStore.subscribe(
      (s) => s.state.data,
      () => {
        appStore.getState().permissions.resolvePermissions();
      }
    );
  }, []);

  useEffect(() => {
    return appStore.subscribe(
      (s) => s.config,
      () => {
        appStore.getState().permissions.resolvePermissions();
      }
    );
  }, []);
};
