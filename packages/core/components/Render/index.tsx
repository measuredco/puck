"use client";

import { rootDroppableId } from "../../lib/root-droppable-id";
import { Config, Data, UserGenerics } from "../../types";
import { DropZone, DropZoneProvider } from "../DropZone";

export function Render<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({
  config,
  data,
}: {
  config: UserConfig;
  data: Partial<G["UserData"] | Data>;
}) {
  const defaultedData = {
    ...data,
    root: data.root || {},
    content: data.content || [],
  };

  // DEPRECATED
  const rootProps = defaultedData.root.props || defaultedData.root;
  const title = rootProps?.title || "";

  if (config.root?.render) {
    return (
      <DropZoneProvider value={{ data: defaultedData, config, mode: "render" }}>
        <config.root.render
          {...rootProps}
          puck={{
            renderDropZone: DropZone,
            isEditing: false,
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
    <DropZoneProvider value={{ data: defaultedData, config, mode: "render" }}>
      <DropZone zone={rootDroppableId} />
    </DropZoneProvider>
  );
}
