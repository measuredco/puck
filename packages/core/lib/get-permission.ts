import { useAppContext } from "../components/Puck/context";
import { ComponentData } from "../types/Config";

export const getPermission = ({
  permission,
  selectedItem,
}: {
  permission: string;
  selectedItem: ComponentData;
}) => {
  let componentPermissions = initialPermissions({ selectedItem: selectedItem });

  return componentPermissions?.[permission] !== undefined
    ? componentPermissions[permission]
    : null;
};

export const initialPermissions = ({
  selectedItem,
}: {
  selectedItem: ComponentData;
}) => {
  const { state, config } = useAppContext();

  let componentPermissions = { ...state.ui.globalPermissions };

  if (config.components[selectedItem.type] !== undefined) {
    componentPermissions = {
      ...componentPermissions,
      ...config.components[selectedItem.type].permissions,
    };
  }

  return componentPermissions;
};
