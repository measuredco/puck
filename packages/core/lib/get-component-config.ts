import { Config } from "../types";

export const getComponentConfig = (config: Config, type: string | number) => {
  const component = config.components[type];

  return typeof component === "function"
    ? component(config.context)
    : component;
};
