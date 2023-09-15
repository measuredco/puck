import { Data } from "../types/Config";
import { generateId } from "./generate-id";
import { getDropzoneId } from "./get-dropzone-id";

export const reduceRelatedDropzones = (
  item: Data["content"][0],
  data: Data,
  fn: (
    dropzones: Required<Data>["dropzones"],
    key: string,
    dropzone: Required<Data>["dropzones"][0]
  ) => Required<Data>["dropzones"]
) => {
  return {
    ...data,
    dropzones: Object.keys(data.dropzones || {}).reduce<
      Required<Data>["dropzones"]
    >((acc, key) => {
      const [parentId] = getDropzoneId(key);

      if (parentId === item.props.id) {
        const dropzones = data.dropzones!;
        return fn(acc, key, dropzones[key]);
      }

      return { ...acc, [key]: data.dropzones![key] };
    }, {}),
  };
};

const findRelatedByDropzoneId = (dropzoneId: string, data: Data) => {
  const [dropzoneParentId] = getDropzoneId(dropzoneId);

  return (data.dropzones![dropzoneId] || []).reduce((acc, dropzoneItem) => {
    const related = findRelatedByItem(dropzoneItem, data);

    if (dropzoneItem.props.id === dropzoneParentId) {
      return { ...acc, ...related, [dropzoneId]: dropzoneItem };
    }

    return { ...acc, ...related };
  }, {});
};

const findRelatedByItem = (item: Data["content"][0], data: Data) => {
  return Object.keys(data.dropzones || {}).reduce((acc, dropzoneId) => {
    const [dropzoneParentId] = getDropzoneId(dropzoneId);

    if (item.props.id === dropzoneParentId) {
      const related = findRelatedByDropzoneId(dropzoneId, data);

      return {
        ...acc,
        ...related,
        [dropzoneId]: data.dropzones![dropzoneId],
      };
    }

    return acc;
  }, {});
};

/**
 * Remove all related dropzones
 *
 * TODO There might be a cleaner way to do this with reducers.
 */
export const removeRelatedDropzones = (
  item: Data["content"][0],
  data: Data
) => {
  const newData = { ...data };

  const related = findRelatedByItem(item, data);

  Object.keys(related).forEach((key) => {
    delete newData.dropzones![key];
  });

  return newData;
};

export const duplicateRelatedDropzones = (
  item: Data["content"][0],
  data: Data,
  newId: string
) => {
  return reduceRelatedDropzones(item, data, (acc, key, dropzone) => {
    const dupedDropzone = dropzone.map((dropzoneItem) => ({
      ...dropzoneItem,
      props: { ...dropzoneItem.props, id: generateId(dropzoneItem.type) },
    }));

    // We need to dupe any related items in our dupes
    const dupeOfDupes = dupedDropzone.reduce(
      (dupeOfDupes, item, index) => ({
        ...dupeOfDupes,
        ...duplicateRelatedDropzones(dropzone[index], data, item.props.id)
          .dropzones,
      }),
      acc
    );

    const [_, dropzoneId] = getDropzoneId(key);

    return {
      ...dupeOfDupes,
      [key]: dropzone,
      [`${newId}:${dropzoneId}`]: dupedDropzone,
    };
  });
};
