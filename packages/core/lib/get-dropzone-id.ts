export const getDropzoneId = (dropzoneCompound?: string) => {
  if (!dropzoneCompound) {
    return [];
  }

  if (dropzoneCompound && dropzoneCompound.indexOf(":") > -1) {
    return dropzoneCompound.split(":");
  }

  return ["root", dropzoneCompound];
};
