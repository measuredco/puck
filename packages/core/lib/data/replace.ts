export const replace = (list: any[], index: number, newItem: any) => {
  const result = Array.from(list);
  result.splice(index, 1);
  result.splice(index, 0, newItem);

  return result;
};
