import { v4 as uuidv4 } from "uuid";

export const generateId = (type?: string | number) =>
  type ? `${type}-${uuidv4()}` : uuidv4();
