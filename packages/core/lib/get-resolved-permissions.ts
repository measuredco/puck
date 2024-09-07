import { ComponentData, Config, Permissions, UserGenerics } from "../types";
import { getChanged } from "./get-changed";

import { resolvePermissions } from "./resolve-permissions";

const cache: {
  lastPermissions: Record<string, Partial<Permissions>>;
  lastSelected: ComponentData | null;
} = { lastPermissions: {}, lastSelected: null };

export const getResolvedPermissions = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({
  item,
  type,
  globalPermissions,
  config,
  appState,
}: {
  item?: G["UserData"]["content"][0] | undefined;
  type?: string;
  globalPermissions: Partial<Permissions>;
  config: UserConfig;
  appState: G["UserAppState"];
}) => {
  const componentType = type || (item && item.type) || "";
  const componentId = (item && item.props.id) || "";

  let componentPermissions = getInitialPermissions<UserConfig>({
    componentType,
    config,
    globalPermissions,
  });

  const changed = getChanged(item, cache.lastSelected);

  if (item && Object.values(changed).some((el) => el === true)) {
    const resolvedPermissions = resolvePermissions({
      data: item,
      config,
      changed,
      lastPermissions:
        cache.lastPermissions[componentId] || componentPermissions,
      permissions: componentPermissions,
      lastData: cache.lastSelected as any,
      appState,
    });

    if (resolvedPermissions !== undefined) {
      componentPermissions = {
        ...componentPermissions,
        ...resolvedPermissions,
      };
    }

    cache.lastSelected = item;
    cache.lastPermissions[componentId] = componentPermissions;

    return componentPermissions;
  }

  if (
    Object.keys(componentId && cache.lastPermissions[componentId]).length !== 0
  ) {
    componentPermissions = cache.lastPermissions[componentId];
  }

  return componentPermissions;
};

export const getInitialPermissions = <UserConfig extends Config = Config>({
  componentType,
  globalPermissions,
  config,
}: {
  componentType: string;
  globalPermissions: Partial<Permissions>;
  config: UserConfig;
}) => {
  return {
    ...globalPermissions,
    ...config.components[componentType as string]?.permissions,
  };
};
