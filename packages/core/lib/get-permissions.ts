import { Config, DefaultComponentProps, Permissions } from "../types/Config";

export const getPermissions = ({
  componentType,
  globalPermissions,
  config,
}: {
  componentType: keyof DefaultComponentProps;
  globalPermissions: Partial<Permissions>;
  config: Config;
}) => {
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
  let componentPermissions: Partial<Permissions> = { ...globalPermissions };

  componentPermissions = {
    ...componentPermissions,
    ...config.components[componentType].permissions,
  };

  return componentPermissions;
};
