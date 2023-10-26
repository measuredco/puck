"use client";

import { Data, Render } from "@measured/puck";
import config from "../../config";

export async function ClientRender({ data }: { data: Data }) {
  return <Render data={data} config={config} />;
}
