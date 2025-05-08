import { Config } from "../../types";

export const isSlot = (prop: any) =>
  Array.isArray(prop) &&
  typeof prop[0]?.type === "string" &&
  typeof prop[0]?.props === "object";

export const createIsSlotConfig =
  (config: Config) =>
  (itemType: string, propName: string, propValue: string) => {
    const configForComponent =
      itemType === "root" ? config?.root : config?.components[itemType];

    if (!configForComponent) return isSlot(propValue);

    return configForComponent.fields?.[propName]?.type === "slot";
  };
