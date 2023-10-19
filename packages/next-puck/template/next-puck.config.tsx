import { Data } from "@measured/puck";
import { NextPuckConfig } from "@measured/next-puck";
import fs from "fs";

const config: NextPuckConfig = {
  /**
   * next-puck configuration
   *
   * These are called from the next-puck controlled routes in /app/[...puckPath] and /app/puck.
   *
   * If you eject from next-puck, you may wish to move them inline into your routes.
   */

  readPageServer: async (path) => {
    // Use JSON database by default
    const allData: Record<string, Data> | null = fs.existsSync("database.json")
      ? JSON.parse(fs.readFileSync("database.json", "utf-8"))
      : null;

    return allData ? allData[path] : null;
  },

  writePageServer: async (request) => {
    const payload = await request.json();

    const existingData = JSON.parse(
      fs.existsSync("database.json")
        ? fs.readFileSync("database.json", "utf-8")
        : "{}"
    );

    const updatedData = {
      ...existingData,
      [payload.path]: payload.data,
    };

    fs.writeFileSync("database.json", JSON.stringify(updatedData));
  },
};

export default config;
