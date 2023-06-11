"use client";

import { Data } from "core/types/Config";
import { Puck, Render } from "core";
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
            body: JSON.stringify({ [path]: data }),
          });
        }}
      />
    );
  }

  return <Render config={config} data={data} />;
}
