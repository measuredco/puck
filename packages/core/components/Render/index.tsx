"use client";

import { rootDroppableId } from "../../lib/root-droppable-id";
import { Config, Data } from "../../types/Config";
import { DropZone, DropZoneProvider } from "../DropZone";
import { migrate } from "../../transforms";

export function Render({
  config,
  data,
}: {
  config: Config<any, any, any>;
  data: Data;
}) {
  const currentData = migrate(data);

  const rootProps = currentData.root.props;
  const title = rootProps?.title || "";

  if (config.root?.render) {
    return (
      <DropZoneProvider value={{ data: currentData, config, mode: "render" }}>
        <config.root.render
          {...rootProps}
          puck={{
            renderDropZone: DropZone,
          }}
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
    <DropZoneProvider value={{ data: currentData, config, mode: "render" }}>
      <DropZone zone={rootDroppableId} />
    </DropZoneProvider>
  );
}
