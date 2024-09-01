export const filter = (obj: Record<any, any>, validKeys: string[]) => {
  return validKeys.reduce((acc, item) => {
    if (typeof obj[item] !== "undefined") {
      return { ...acc, [item]: obj[item] };
    }

    return acc;
  }, {});
};
