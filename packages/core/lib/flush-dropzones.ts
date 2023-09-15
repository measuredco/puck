import { Data } from "../types/Config";
import { addToDropzoneCache } from "./reducer";

/**
 * Flush out all dropzones and let them re-register using the dropzone cache
 *
 * @param data initial data
 * @returns data with dropzones removed
 */
export const flushDropzones = (data: Data): Data => {
  const containsDropzones = typeof data.dropzones !== "undefined";

  if (containsDropzones) {
    Object.keys(data.dropzones || {}).forEach((dropzone) => {
      addToDropzoneCache(dropzone, data.dropzones![dropzone]);
    });

    return {
      ...data,
      dropzones: {},
    };
  }

  return data;
};
