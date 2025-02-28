import { CSSProperties } from "react";
import {
  rootAreaId,
  rootDroppableId,
  rootZone,
} from "../../lib/root-droppable-id";
import { setupZone } from "../../lib/setup-zone";
import { Config, Data, Metadata, UserGenerics } from "../../types";

type DropZoneRenderProps = {
  zone: string;
  data: Data;
  config: Config;
  areaId?: string;
  style?: CSSProperties;
  metadata?: Metadata;
};

function DropZoneRender({
  zone,
  data,
  areaId = "root",
  config,
  metadata = {},
}: DropZoneRenderProps) {
  let zoneCompound = rootDroppableId;
  let content = data?.content || [];

  if (!data || !config) {
    return null;
  }

  if (areaId !== rootAreaId && zone !== rootZone) {
    zoneCompound = `${areaId}:${zone}`;
    content = setupZone(data, zoneCompound).zones[zoneCompound];
  }

  return (
    <>
      {content.map((item) => {
        const Component = config.components[item.type];

        if (Component) {
          return (
            <Component.render
              key={item.props.id}
              {...item.props}
              puck={{
                renderDropZone: ({ zone }: { zone: string }) => (
                  <DropZoneRender
                    zone={zone}
                    data={data}
                    areaId={item.props.id}
                    config={config}
                    metadata={metadata}
                  />
                ),
                metadata,
              }}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export function Render<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({
  config,
  data,
  metadata,
}: {
  config: UserConfig;
  data: G["UserData"];
  metadata?: Metadata;
}) {
  if (config.root?.render) {
    // DEPRECATED
    const rootProps = data.root.props || data.root;

    const title = rootProps.title || "";

    return (
      <config.root.render
        {...rootProps}
        puck={{
          renderDropZone: ({ zone }: { zone: string }) => (
            <DropZoneRender
              zone={zone}
              data={data}
              config={config}
              metadata={metadata}
            />
          ),
          isEditing: false,
          dragRef: null,
        }}
        title={title}
        editMode={false}
        id={"puck-root"}
      >
        <DropZoneRender
          config={config}
          data={data}
          zone={rootZone}
          metadata={metadata}
        />
      </config.root.render>
    );
  }

  return (
    <DropZoneRender
      config={config}
      data={data}
      zone={rootZone}
      metadata={metadata}
    />
  );
}
