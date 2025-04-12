import { ComponentData, Config, Metadata, RootDataWithProps } from "../types";
import { mapSlots } from "./map-slots";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange: Record<string, any>;
} = { lastChange: {} };

export const resolveComponentData = async <
  T extends ComponentData | RootDataWithProps
>(
  item: T,
  config: Config,
  metadata: Metadata = {},
  onResolveStart?: (item: T) => void,
  onResolveEnd?: (item: T) => void,
  recursive: boolean = true
) => {
  const configForItem =
    "type" in item ? config.components[item.type] : config.root;

  if (configForItem?.resolveData) {
    const id = "id" in item.props ? item.props.id : "root";

    const { item: oldItem = null, resolved = {} } = cache.lastChange[id] || {};

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
      resolvedItem = (await mapSlots(resolvedItem, async (content) => {
        return Promise.all(
          content.map(async (childItem) =>
            resolveComponentData(
              childItem as T,
              config,
              metadata,
              onResolveStart,
              onResolveEnd,
              false
            )
          )
        );
      })) as T;
    }

    if (Object.keys(readOnly).length) {
      resolvedItem.readOnly = readOnly;
    }

    cache.lastChange[id] = {
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
