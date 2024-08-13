import {
  ComponentConfig,
  ComponentData,
  DefaultRootProps,
  RootData,
} from "../types/Config";

export const overlayActions = (
  componentConfig: ComponentConfig | DefaultRootProps | undefined,
  item: ComponentData | RootData
) => ({
  isEditable: true,
  isDuplicatable: true,
  isDeleteable: true,
  isDraggable: true,
  ...componentConfig?.overlayActions,
  ...item?.overlayActions,
});
