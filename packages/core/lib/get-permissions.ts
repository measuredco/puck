import { AppState, ComponentData, Config } from "../types/Config";

export const getPermissions = ({
  permissions,
  selectedItem,
  state,
  config,
}: {
  permissions: string[];
  selectedItem: ComponentData | undefined;
  state: AppState;
  config: Config;
}) => {
  let componentPermissions =
    selectedItem && initialPermissions({ selectedItem, config, state });

  const computedPermissions = componentPermissions
    ? Object.keys(componentPermissions)
        .filter((key) => permissions.includes(key))
        .reduce((obj, key) => {
          obj[key] = componentPermissions[key] ?? null;
          return obj;
        }, {} as { [key: string]: boolean | null })
    : null;

  return computedPermissions;
};

export const initialPermissions = ({
  selectedItem,
  state,
  config,
}: {
  selectedItem: ComponentData;
  state: AppState;
  config: Config;
}) => {
  let componentPermissions = { ...state.ui.globalPermissions };

  if (config.components[selectedItem.type] !== undefined) {
    componentPermissions = {
      ...componentPermissions,
      ...config.components[selectedItem.type].permissions,
    };
  }

  return componentPermissions;
};
