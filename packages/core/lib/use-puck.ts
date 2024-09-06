import { useAppContext } from "../components/Puck/context";
import { Config, UserGenerics } from "../types";
import { getPermissions } from "./get-permissions";

export const usePuck = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>() => {
  const {
    state: appState,
    config,
    history,
    dispatch,
    selectedItem: currentItem,
    globalPermissions,
  } = useAppContext<UserConfig>();

  return {
    appState,
    config,
    dispatch,
    getPermissions: ({
      item,
      type,
    }: {
      item?: G["UserData"]["content"][0];
      type?: keyof G["UserProps"];
    } = {}) => {
      return getPermissions<UserConfig>({
        selectedItem: item || currentItem,
        type: type as string,
        globalPermissions: globalPermissions || {},
        config,
        appState,
      });
    },
    history: {
      back: history.back!,
      forward: history.forward!,
      setHistories: history.setHistories!,
      setHistoryIndex: history.setHistoryIndex!,
      hasPast: history.historyStore!.hasPast,
      hasFuture: history.historyStore!.hasFuture,
      histories: history.historyStore!.histories,
      index: history.historyStore!.index,
      historyStore: history.historyStore,
    },
    selectedItem: currentItem || null,
  };
};
