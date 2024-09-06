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
  selectedItem,
  config,
  changed,
  lastPermissions,
  initialPermissions,
  appState,
}: {
  selectedItem: UserData["content"][0] | undefined;
  config: UserConfig;
  changed: Record<string, boolean>;
  lastPermissions: Partial<Permissions>;
  initialPermissions: Partial<Permissions>;
  appState: AppState<UserData>;
}) => {
  const componentConfig = selectedItem
    ? config.components[selectedItem.type]
    : null;

  if (selectedItem && componentConfig?.resolvePermissions) {
    return componentConfig.resolvePermissions(selectedItem, {
      changed,
      lastPermissions,
      initialPermissions,
      appState,
    });
  }

  return {};
};
