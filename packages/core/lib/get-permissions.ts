import { ComponentData, Config, Permissions, UserGenerics } from "../types";
import { getChanged } from "./get-changed";

import { resolvePermissions } from "./resolve-permissions";

const cache: {
  lastPermissions: Record<string, Partial<Permissions>>;
  lastSelected: ComponentData | null;
} = { lastPermissions: {}, lastSelected: null };

export const getPermissions = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({
  selectedItem,
  type,
  globalPermissions,
  config,
  appState,
}: {
  selectedItem?: G["UserData"]["content"][0] | undefined;
  type?: string;
  globalPermissions: Partial<Permissions>;
  config: UserConfig;
  appState: G["UserAppState"];
}) => {
  const componentType = type || (selectedItem && selectedItem.type) || "";
  const componentId = (selectedItem && selectedItem.props.id) || "";

  let componentPermissions = getInitialPermissions<UserConfig>({
    componentType,
    config,
    globalPermissions,
  });

  const changed = getChanged(selectedItem, cache.lastSelected || {});

  if (selectedItem && Object.values(changed).some((el) => el === true)) {
    const resolvedPermissions = resolvePermissions({
      data: selectedItem,
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

    cache.lastSelected = selectedItem;
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
