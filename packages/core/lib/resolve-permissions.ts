import { AppState, ComponentData, Config, Permissions } from "../types";

export const resolvePermissions = ({
  selectedItem,
  config,
  changed,
  lastPermissions,
  initialPermissions,
  appState,
}: {
  selectedItem: ComponentData | undefined;
  config: Config;
  changed: Record<string, boolean>;
  lastPermissions: Partial<Permissions>;
  initialPermissions: Partial<Permissions>;
  appState: AppState;
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
