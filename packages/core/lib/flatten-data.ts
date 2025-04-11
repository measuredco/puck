import { ComponentData, Config, UserGenerics } from "../types";
import { PrivateAppState } from "../types/Internal";
import { walkTree } from "./walk-tree";

export const flattenData = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  state: PrivateAppState<G["UserData"]>
) => {
  const data: ComponentData[] = [];

  walkTree(
    state,
    (content) => content,
    (item) => {
      data.push(item);

      return null;
    }
  );

  return data;
};
