import { CSSProperties } from "react";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { Config, Data } from "../../types/Config";
import { setupZone } from "../../lib/setup-zone";

type DropZoneRenderProps = {
  zone: string;
  data: Data;
  config: Config;
  areaId?: string;
  style?: CSSProperties;
};

function DropZoneRender({
  zone,
  data,
  areaId = "root",
  config,
}: DropZoneRenderProps) {
  let zoneCompound = rootDroppableId;
  let content = data?.content || [];

  if (!data || !config) {
    return null;
  }

  if (areaId && zone && zone !== rootDroppableId) {
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
              puckCtx={{
                DropZone: (zone: string) => (
                  <DropZoneRender
                    zone={zone}
                    data={data}
                    areaId={item.props.id}
                    config={config}
                  />
                ),
              }}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export function Render({ config, data }: { config: Config; data: Data }) {
  // DEPRECATED
  const rootProps = data.root.props || data.root;

  const title = rootProps.title || "";

  if (config.root?.render) {
    return (
      <config.root.render {...data.root} editMode={false} id={"puck-root"}>
        <DropZoneRender config={config} data={data} zone={rootDroppableId} />
      </config.root.render>
    );
  }

  return <DropZoneRender config={config} data={data} zone={rootDroppableId} />;
}
