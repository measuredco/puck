import { ComponentData, Config, MappedItem, Metadata } from "../types";
import { mapSlots } from "./map-slots";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange: Record<string, any>;
} = { lastChange: {} };

export const resolveComponentData = async (
  item: ComponentData,
  config: Config,
  metadata: Metadata = {},
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void,
  recursive: boolean = true
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

    let resolvedItem = {
      ...item,
      props: {
        ...item.props,
        ...resolvedProps,
      },
    };

    if (recursive) {
      resolvedItem = await mapSlots(resolvedItem, async (content) => {
        return Promise.all(
          content.map(async (childItem) =>
            resolveComponentData(
              childItem,
              config,
              metadata,
              onResolveStart,
              onResolveEnd,
              false
            )
          )
        );
      });
    }

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
