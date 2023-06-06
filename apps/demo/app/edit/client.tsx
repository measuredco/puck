"use client";

import config, { initialData } from "../../puck.config";
import { Data } from "core/types/Config";
import { Puck } from "core";

export default function Client({ data }: { data: Data }) {
  let defaultedData = data;

  if (Object.keys(data).length === 0) {
    defaultedData = initialData;
  }

  return (
    <Puck
      config={config}
      initialData={defaultedData}
      onPublish={async (_data) => {
        console.log("Publishing");

        await fetch("/api/puck", {
          method: "post",
          body: JSON.stringify(_data),
        });
      }}
    />
  );
}
