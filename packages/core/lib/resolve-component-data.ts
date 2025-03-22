import { ComponentData, Config, Content, MappedItem, Metadata } from "../types";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange: Record<string, any>;
} = { lastChange: {} };

export const resolveAllComponentData = async (
  content: MappedItem[],
  config: Config,
  metadata: Metadata = {},
  zones: Record<string, Content> | undefined,
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  return await Promise.all(
    content.map(async (item) => {
      return await resolveComponentData(
        item,
        config,
        metadata,
        zones,
        onResolveStart,
        onResolveEnd
      );
    })
  );
};

export const resolveComponentData = async (
  item: ComponentData,
  config: Config,
  metadata: Metadata = {},
  zones: Record<string, Content> | undefined,
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  const configForItem = config.components[item.type];
  if (configForItem.resolveData) {
    const { item: oldItem = null, resolved = {} } =
      cache.lastChange[item.props.id] || {};

    const itemWithSlots = {
      ...item,
      props: Object.keys(item.props).reduce(
        (acc, propKey) => ({
          ...acc,
          [propKey]:
            configForItem.fields?.[propKey]?.type === "slot"
              ? zones?.[`${item.props.id}:${propKey}`] ?? {}
              : item.props[propKey],
        }),
        {}
      ),
    } as ComponentData;

    if (itemWithSlots && itemWithSlots === oldItem) {
      return resolved;
    }

    const changed = getChanged(itemWithSlots, oldItem);

    if (onResolveStart) {
      onResolveStart(itemWithSlots);
    }

    const { props: resolvedProps, readOnly = {} } =
      await configForItem.resolveData(itemWithSlots, {
        changed,
        lastData: oldItem,
        metadata,
      });

    const resolvedItem = {
      ...itemWithSlots,
      props: {
        ...item.props,
        ...resolvedProps,
      },
    };

    if (Object.keys(readOnly).length) {
      resolvedItem.readOnly = readOnly;
    }

    cache.lastChange[item.props.id] = {
      item,
      resolved: resolvedItem,
    };

    if (onResolveEnd) {
      onResolveEnd(resolvedItem);
    }

    return resolvedItem;
  }

  return item;
};
