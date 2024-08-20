import { AppState, ComponentData, Config } from "../types/Config";

export const getPermission = ({
  permission,
  selectedItem,
  state,
  config,
}: {
  permission: string;
  selectedItem: ComponentData | undefined;
  state: AppState;
  config: Config;
}) => {
  let componentPermissions =
    selectedItem && initialPermissions({ selectedItem, config, state });

  return componentPermissions?.[permission] !== undefined
    ? componentPermissions[permission]
    : null;
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
