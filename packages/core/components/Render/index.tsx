"use client";

import { rootDroppableId } from "../../lib/root-droppable-id";
import { Config, Data, Metadata, UserGenerics } from "../../types";
import {
  DropZonePure,
  DropZoneProvider,
  DropZoneRenderPure,
} from "../DropZone";
import React from "react";

export const renderContext = React.createContext<{
  config: Config;
  data: Data;
  metadata: Metadata;
}>({
  config: { components: {} },
  data: { root: {}, content: [] },
  metadata: {},
});

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
      <renderContext.Provider value={{ config, data: defaultedData, metadata }}>
        <DropZoneProvider
          value={{
            mode: "render",
            depth: 0,
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
            <DropZoneRenderPure zone={rootDroppableId} />
          </config.root.render>
        </DropZoneProvider>
      </renderContext.Provider>
    );
  }

  return (
    <renderContext.Provider value={{ config, data: defaultedData, metadata }}>
      <DropZoneProvider
        value={{
          mode: "render",
          depth: 0,
        }}
      >
        <DropZoneRenderPure zone={rootDroppableId} />
      </DropZoneProvider>
    </renderContext.Provider>
  );
}
