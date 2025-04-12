import { forwardRef } from "react";
import { DropZoneProps } from "../DropZone/types";
import { Config, Metadata, Slot } from "../../types";
import { useSlots } from "../../lib/use-slots";
import { DropZoneRenderPure } from "../DropZone";

type SlotRenderProps = DropZoneProps & {
  content: Slot;
  config: Config;
  metadata: Metadata;
};

export const SlotRenderPure = (props: SlotRenderProps) => (
  <SlotRender {...props} />
);

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
          const Component = config.components[item.type];
          if (Component) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const props = useSlots(Component, item.props, (slotProps) => (
              <SlotRenderPure
                {...slotProps}
                config={config}
                metadata={metadata}
              />
            ));

            return (
              <Component.render
                key={props.id}
                {...props}
                puck={{
                  renderDropZone: DropZoneRenderPure,
                  metadata: metadata || {},
                }}
              />
            );
          }

          return null;
        })}
      </div>
    );
  }
);
