import { flatten, unflatten } from "flat";
import { ComponentData, Config, RootData, UserGenerics } from "../../types";
import { stripSlots } from "./strip-slots";

export const flattenNode = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  node: ComponentData | RootData,
  config: UserConfig
) => {
  return {
    ...node,
    props: flatten(stripSlots(node, config).props),
  };
};

export const expandNode = (node: ComponentData | RootData) => {
  const props = unflatten(node.props);

  return {
    ...node,
    props,
  };
};
