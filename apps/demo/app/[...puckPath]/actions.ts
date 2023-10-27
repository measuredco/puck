"use server";

import { cache } from "react";
import { Data } from "@measured/puck";
import seedData from "../../seed.data.json";

const getPuckParam = (key: string) => ({ puckPath: key.split("/").slice(1) });

export const getPageData = cache(async (url: string): Promise<Data | null> => {
  return seedData[url] || null;
});

export const publishPageData = async (
  _key: string,
  _data: Data
): Promise<void> => {
  // no-op
};
