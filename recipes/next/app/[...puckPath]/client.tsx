"use client";

import type { Data } from "@measured/puck";
import { Puck, Render } from "@measured/puck";
import config from "../../puck.config";

export function Client({
  path,
  data,
  isEdit,
}: {
  path: string;
  data: Data;
  isEdit: boolean;
}) {
  if (isEdit) {
    return (
      <Puck
        config={config}
        data={data}
        onPublish={async (data: Data) => {
          await fetch("/api/puck", {
            method: "post",
            body: JSON.stringify({ data, path }),
          });
        }}
      />
    );
  }

  return <Render config={config} data={data} />;
}
