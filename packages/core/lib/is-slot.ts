export const isSlot = (prop: any) =>
  Array.isArray(prop) &&
  typeof prop[0]?.type === "string" &&
  typeof prop[0]?.props === "object";
