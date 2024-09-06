import {
  AppState,
  ComponentData,
  Config,
  Data,
  ExtractPropsFromConfig,
  ExtractRootPropsFromConfig,
  Permissions,
} from "../types";

export const resolvePermissions = <
  UserConfig extends Config = Config,
  UserProps extends ExtractPropsFromConfig<UserConfig> = ExtractPropsFromConfig<UserConfig>,
  UserRootProps extends ExtractRootPropsFromConfig<UserConfig> = ExtractRootPropsFromConfig<UserConfig>,
  UserData extends Data<UserProps, UserRootProps> | Data = Data<
    UserProps,
    UserRootProps
  >
>({
  data,
  lastData,
  config,
  changed,
  lastPermissions,
  permissions,
  appState,
}: {
  data: UserData["content"][0] | undefined;
  lastData: UserData["content"][0] | null;
  config: UserConfig;
  changed: Record<string, boolean>;
  lastPermissions: Partial<Permissions>;
  permissions: Partial<Permissions>;
  appState: AppState<UserData>;
}) => {
  const componentConfig = data ? config.components[data.type] : null;

  if (data && lastData && componentConfig?.resolvePermissions) {
    return componentConfig.resolvePermissions(data, {
      changed,
      lastPermissions,
      permissions,
      appState,
      lastData,
    });
  }

  return {};
};
