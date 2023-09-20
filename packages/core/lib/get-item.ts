import { Data } from "../types/Config";
import { rootDroppableId } from "./root-droppable-id";
import { setupZone } from "./setup-zone";

export type ItemSelector = {
  index: number;
  zone?: string;
};

export const getItem = (
  selector: ItemSelector,
  data: Data
): Data["content"][0] | undefined => {
  if (!selector.zone || selector.zone === rootDroppableId) {
    return data.content[selector.index];
  }

  return setupZone(data, selector.zone).zones[selector.zone][selector.index];
};
