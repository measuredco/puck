import { randomBytes } from "crypto";

export const generateId = (type: string | number) =>
  `${type}-${randomBytes(20).toString("hex")}`;
