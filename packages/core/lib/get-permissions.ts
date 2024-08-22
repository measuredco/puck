import {
  ComponentData,
  Config,
  DefaultComponentProps,
  Permissions,
} from "../types/Config";

export const getPermissions = ({
  selectedItem,
  type,
  globalPermissions,
  config,
}: {
  selectedItem?: ComponentData | undefined;
  type?: keyof DefaultComponentProps;
  globalPermissions: Partial<Permissions>;
  config: Config;
}) => {
  const componentType = (selectedItem && selectedItem.type) || type || "";
  let componentPermissions = getInitialPermissions({
    componentType,
    config,
    globalPermissions,
  });

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
