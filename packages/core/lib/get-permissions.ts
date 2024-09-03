import {
  AppState,
  ComponentData,
  Config,
  DefaultComponentProps,
  Permissions,
} from "../types";
import { getChanged } from "./get-changed";

import { resolvePermissions } from "./resolve-permissions";

const cache: {
  lastPermissions: Record<string, Partial<Permissions>>;
  lastSelected: ComponentData | {} | undefined;
} = { lastPermissions: {}, lastSelected: {} };

export const getPermissions = ({
  selectedItem,
  type,
  globalPermissions,
  config,
  appState,
}: {
  selectedItem?: ComponentData | undefined;
  type?: keyof DefaultComponentProps;
  globalPermissions: Partial<Permissions>;
  config: Config;
  appState: AppState;
}) => {
  const componentType = type || (selectedItem && selectedItem.type) || "";
  const componentId = (selectedItem && selectedItem.props.id) || "";

  let componentPermissions = getInitialPermissions({
    componentType,
    config,
    globalPermissions,
  });

  const changed = getChanged(selectedItem, cache.lastSelected);

  if (Object.values(changed).some((el) => el === true)) {
    const resolvedPermissions = resolvePermissions({
      selectedItem,
      config,
      changed,
      lastPermissions:
        cache.lastPermissions[componentId] || componentPermissions,
      initialPermissions: componentPermissions,
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

export const getInitialPermissions = ({
  componentType,
  globalPermissions,
  config,
}: {
  componentType: keyof DefaultComponentProps;
  globalPermissions: Partial<Permissions>;
  config: Config;
}) => {
  return {
    ...globalPermissions,
    ...config.components[componentType]?.permissions,
  };
};
