"use client";

import { rootDroppableId } from "../../lib/root-droppable-id";
import { Config, Data } from "../../types/Config";
import { DropZone, DropZoneProvider } from "../DropZone";

export function Render({ config, data }: { config: Config; data: Data }) {
  if (config.root) {
    return (
      <DropZoneProvider value={{ data, config, mode: "render" }}>
        <config.root.render {...data.root} editMode={false}>
          <DropZone dropzone={rootDroppableId} />
        </config.root.render>
      </DropZoneProvider>
    );
  }

  return (
    <DropZoneProvider value={{ data, config, mode: "render" }}>
      <DropZone dropzone={rootDroppableId} />
    </DropZoneProvider>
  );
}
