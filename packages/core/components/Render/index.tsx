"use client";

import { Config, Data } from "../../types/Config";
import { DropZoneProvider } from "../DropZone";
import { Render as ServerRender } from "../ServerRender";

export function Render({ config, data }: { config: Config; data: Data }) {
  return (
    // DEPRECATED
    // Can be removed once exporting DropZone is removed
    <DropZoneProvider value={{ data, config, mode: "render" }}>
      <ServerRender config={config} data={data} />
    </DropZoneProvider>
  );
}
