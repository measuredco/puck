import { Content, Data } from "../types/Config";
import { getDropzoneId } from "./get-dropzone-id";

export const findDropzonesForArea = (
  data: Data,
  area: string
): Record<string, Content> => {
  const { dropzones = {} } = data;

  const result = Object.keys(dropzones).filter(
    (dropzoneKey) => getDropzoneId(dropzoneKey)[0] === area
  );

  return result.reduce((acc, key) => {
    return { ...acc, [key]: dropzones[key] };
  }, {});
};
