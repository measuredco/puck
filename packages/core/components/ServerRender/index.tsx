import { CSSProperties } from "react";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { setupZone } from "../../lib/setup-zone";
import { Config, Data, FieldProps, UserGenerics } from "../../types";

type DropZoneRenderProps = {
  zone: string;
  data: Data;
  config: Config;
  areaId?: string;
  style?: CSSProperties;
  externalData?: any;
};

function DropZoneRender({
  zone,
  data,
  areaId = "root",
  config,
  externalData
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
        const transformedItem = beforeServerRenderProps({ props: item.props }, externalData, config.components[item.type].beforeRender);

        if (Component) {
          return (
            <Component.render
              key={item.props.id}
              {...transformedItem.props}
              puck={{
                renderDropZone: ({ zone }: { zone: string }) => (
                  <DropZoneRender
                    zone={zone}
                    data={data}
                    areaId={item.props.id}
                    config={config}
                    externalData={externalData}
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

export function Render<
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>({ config, data, externalData }: { config: UserConfig; data: G["UserData"], externalData?: any }) {
  if (config.root?.render) {
    // DEPRECATED
    const rootProps = data.root.props || data.root;

    const title = rootProps.title || "";

    return (
      <config.root.render
        {...rootProps}
        puck={{
          renderDropZone: ({ zone }: { zone: string }) => (
            <DropZoneRender zone={zone} data={data} config={config} externalData={externalData} />
          ),
          isEditing: false,
          dragRef: null,
        }}
        title={title}
        editMode={false}
        id={"puck-root"}
      >
        <DropZoneRender config={config} data={data} zone={rootDroppableId} externalData={externalData} />
      </config.root.render>
    );
  }

  return <DropZoneRender config={config} data={data} zone={rootDroppableId} externalData={externalData}/>;
}

const beforeServerRenderProps = (original: { props: Partial<FieldProps> | FieldProps }, externalData: any, componentBeforeRender?: (data: | { props: Partial<FieldProps> | FieldProps; }, params: { externalData: any; }) => | { props?: Partial<FieldProps> | FieldProps; }) => {
  if (!componentBeforeRender && typeof componentBeforeRender !== "function") {
    return original;
  }

  const transformed = {
    props: {
      ...componentBeforeRender(original, { externalData }).props,
    },
  };

  return transformed;
}