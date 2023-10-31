"use client";

import { rootDroppableId } from "../../lib/root-droppable-id";
import { Config, Data } from "../../types/Config";
import { DropZone, DropZoneProvider } from "../DropZone";

export function Render({ config, data }: { config: Config; data: Data }) {
  // DEPRECATED
  const rootProps = data.root.props || data.root;

  const title = rootProps.title || "";

  if (config.root?.render) {
    return (
      <DropZoneProvider value={{ data, config, mode: "render" }}>
        <config.root.render
          {...rootProps}
          title={title}
          editMode={false}
          id={"puck-root"}
        >
          <DropZone zone={rootDroppableId} />
        </config.root.render>
      </DropZoneProvider>
    );
  }

  return (
    <DropZoneProvider value={{ data, config, mode: "render" }}>
      <DropZone zone={rootDroppableId} />
    </DropZoneProvider>
  );
}
