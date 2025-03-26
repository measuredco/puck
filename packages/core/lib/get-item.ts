import { AppStore } from "../store";
import { Data } from "../types";
import { rootDroppableId } from "./root-droppable-id";

export type ItemSelector = {
  index: number;
  zone?: string;
};

export function getItem<UserData extends Data>(
  selector: ItemSelector,
  appStore: AppStore
): UserData["content"][0] | undefined {
  const zone = appStore.zones.zones?.[selector.zone || rootDroppableId];

  return zone
    ? appStore.nodes.nodes[zone.contentIds[selector.index]]?.data
    : undefined;
}
