import { ItemSelector } from "./get-item";

export const selectorIs = (a: ItemSelector | null, b: ItemSelector | null) =>
  a?.zone === b?.zone && a?.index === b?.index;
