import { Data } from "../types";

export const defaultData = (data: Partial<Data>) => ({
  ...data,
  root: data.root || {},
  content: data.content || [],
});
