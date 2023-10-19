import { Data } from "@measured/puck";

export * from "./lib/middleware";

export type NextPuckConfig = {
  readPageServer: (path: string) => Promise<Data | null>;
  writePageServer?: (request: Request) => Promise<void>;
};
