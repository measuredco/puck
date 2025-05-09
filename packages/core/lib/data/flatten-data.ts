import { ComponentData, Config, UserGenerics } from "../../types";
import { PrivateAppState } from "../../types/Internal";
import { walkAppState } from "./walk-app-state";

export const flattenData = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  state: PrivateAppState<G["UserData"]>,
  config: UserConfig
) => {
  const data: ComponentData[] = [];

  walkAppState(
    state,
    config,
    (content) => content,
    (item) => {
      data.push(item);

      return null;
    }
  );

  return data;
};
