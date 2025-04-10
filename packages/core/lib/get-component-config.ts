import { Config, DefaultComponentProps } from "../types";

export const getComponentConfig = <
  Props extends DefaultComponentProps = DefaultComponentProps
>(config: Config<Props>, type: string | number) => {
  const component = config.components[type];

  return typeof component === "function"
    ? component(config.context)
    : component;
};
