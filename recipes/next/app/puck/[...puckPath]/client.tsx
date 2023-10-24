"use client";

import type { Data } from "@measured/puck";
import { Puck } from "@measured/puck";
import config from "../../../puck.config";

export function Client({ path, data }: { path: string; data: Data }) {
  return (
    <Puck
      config={config}
      data={data}
      onPublish={async (data: Data) => {
        await fetch("/puck/api", {
          method: "post",
          body: JSON.stringify({ data, path }),
        });
      }}
    />
  );
}
