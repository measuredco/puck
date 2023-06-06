"use client";

import Puck from "core/Puck";
import config, { initialData } from "../config";
import { Data } from "core/types/Config";

export default async function Page() {
  const data: Data = await fetch("http://localhost:3000/api/puck").then((res) =>
    res.json()
  );

  return (
    <Puck
      config={config}
      initialData={data || initialData}
      onPublish={async (data) => {
        console.log("Publishing");

        await fetch("/api/puck", {
          method: "post",
          body: JSON.stringify(data),
        });
      }}
    />
  );
}
