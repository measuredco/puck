import { ComponentData, Config, MappedItem, Metadata } from "../types";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange: Record<string, any>;
} = { lastChange: {} };

export const resolveAllComponentData = async (
  content: MappedItem[],
  config: Config,
  metadata: Metadata = {},
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  return await Promise.all(
    content.map(async (item) => {
      return await resolveComponentData(
        item,
        config,
        metadata,
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
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  const configForItem = config.components[item.type];
  if (configForItem.resolveData) {
    const { item: oldItem = null, resolved = {} } =
      cache.lastChange[item.props.id] || {};

    if (item && item === oldItem) {
      return resolved;
    }

    const changed = getChanged(item, oldItem);

    if (onResolveStart) {
      onResolveStart(item);
    }

    const { props: resolvedProps, readOnly = {} } =
      await configForItem.resolveData(item, {
        changed,
        lastData: oldItem,
        metadata,
      });

    const resolvedItem = {
      ...item,
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
