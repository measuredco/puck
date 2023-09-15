import { Data } from "../types/Config";
import { rootDroppableId } from "./root-droppable-id";

export const setupDropzone = (
  data: Data,
  dropzoneKey: string
): Required<Data> => {
  if (dropzoneKey === rootDroppableId) {
    return data as Required<Data>;
  }

  const newData = { ...data };

  newData.dropzones = data.dropzones || {};

  newData.dropzones[dropzoneKey] = newData.dropzones[dropzoneKey] || [];

  return newData as Required<Data>;
};
