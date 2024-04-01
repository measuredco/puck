import { Data } from "../types/Config";

export const defaultData = (data: Partial<Data>) => ({
  ...data,
  root: data.root || {},
  content: data.content || [],
});
