"use client";

import config from "../puck.config";
import { Data } from "core/types/Config";
import { Render } from "core";

export default function Client({ data }: { data: Data }) {
  return <Render config={config} data={data} />;
}
