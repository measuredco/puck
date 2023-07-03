"use client";

import { Data } from "@measured/puck/types/Config";
import { Puck, Render } from "@measured/puck";
import config from "../../puck.config";
import headingAnalyzer from "../../../../packages/plugin-heading-analyzer";

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
        plugins={[headingAnalyzer]}
      />
    );
  }

  return <Render config={config} data={data} />;
}
