"use client";

import { rootDroppableId } from "../../lib/root-droppable-id";
import { Config, Data, Metadata, UserGenerics } from "../../types";
import { DropZonePure, DropZoneProvider } from "../DropZone";

export function Render<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({
  config,
  data,
  metadata = {},
}: {
  config: UserConfig;
  data: Partial<G["UserData"] | Data>;
  metadata?: Metadata;
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
      <DropZoneProvider
        value={{
          data: defaultedData,
          config,
          mode: "render",
          depth: 0,
          path: [],
          metadata,
        }}
      >
        <config.root.render
          {...rootProps}
          puck={{
            renderDropZone: DropZonePure,
            isEditing: false,
            dragRef: null,
          }}
          title={title}
          editMode={false}
          id={"puck-root"}
        >
          <DropZonePure zone={rootDroppableId} />
        </config.root.render>
      </DropZoneProvider>
    );
  }

  return (
    <DropZoneProvider
      value={{
        data: defaultedData,
        config,
        mode: "render",
        depth: 0,
        path: [],
        metadata,
      }}
    >
      <DropZonePure zone={rootDroppableId} />
    </DropZoneProvider>
  );
}
