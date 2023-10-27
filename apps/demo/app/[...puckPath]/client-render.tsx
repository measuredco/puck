"use client";

import { Data, Render } from "@measured/puck";
import config from "../../config";

function ClientRender({ data }: { data: Data }) {
  return <Render data={data} config={config} />;
}

export default ClientRender;
