import { forwardRef } from "react";
import { DropZoneProps } from "../DropZone/types";
import { ComponentData, Config, Metadata, Slot } from "../../types";
import { useSlots } from "../../lib/use-slots";
import { DropZoneRenderPure } from "../DropZone";
import { useAppStore } from "../../store";

type SlotRenderProps = DropZoneProps & {
  content: Slot;
  config: Config;
  metadata: Metadata;
};

export const SlotRenderPure = (props: SlotRenderProps) => (
  <SlotRender {...props} />
);

export const ContextSlotRender = ({
  componentId,
  zone,
}: {
  componentId: string;
  zone: string;
}) => {
  const config = useAppStore((s) => s.config);
  const metadata = useAppStore((s) => s.metadata);
  const slotContent = useAppStore(
    (s) => s.state.indexes.nodes[componentId]?.data.props[zone] ?? null
  );

  return (
    <SlotRenderPure
      content={slotContent}
      zone={zone}
      config={config}
      metadata={metadata}
    />
  );
};

const Item = ({
  config,
  item,
  metadata,
}: {
  config: Config;
  item: ComponentData;
  metadata: Metadata;
}) => {
  const Component = config.components[item.type];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const props = useSlots(Component, item.props, (slotProps) => (
    <SlotRenderPure {...slotProps} config={config} metadata={metadata} />
  ));

  return (
    <Component.render
      {...props}
      puck={{
        ...props.puck,
        renderDropZone: DropZoneRenderPure,
        metadata: metadata || {},
      }}
    />
  );
};

/**
 * Render a slot.
 *
 * Replacement for DropZoneRender
 */
export const SlotRender = forwardRef<HTMLDivElement, SlotRenderProps>(
  function SlotRenderInternal(
    { className, style, content, config, metadata },
    ref
  ) {
    return (
      <div className={className} style={style} ref={ref}>
        {content.map((item) => {
          if (!config.components[item.type]) {
            return null;
          }

          return (
            <Item
              key={item.props.id}
              config={config}
              item={item}
              metadata={metadata}
            />
          );
        })}
      </div>
    );
  }
);
