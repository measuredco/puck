import { Data } from "../types/Config";
import { rootDroppableId } from "./root-droppable-id";
import { setupDropzone } from "./setup-dropzone";

export type ItemSelector = {
  index: number;
  dropzone?: string;
};

export const getItem = (
  selector: ItemSelector,
  data: Data
): Data["content"][0] | undefined => {
  if (!selector.dropzone || selector.dropzone === rootDroppableId) {
    return data.content[selector.index];
  }

  return setupDropzone(data, selector.dropzone).dropzones[selector.dropzone][
    selector.index
  ];
};
