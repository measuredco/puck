import { ComponentData, Config, MappedItem } from "../types";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange: Record<string, any>;
} = { lastChange: {} };

export const resolveAllComponentData = async (
  content: MappedItem[],
  config: Config,
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  return await Promise.all(
    content.map(async (item) => {
      return await resolveComponentData(
        item,
        config,
        onResolveStart,
        onResolveEnd
      );
    })
  );
};

export const resolveComponentData = async (
  item: ComponentData,
  config: Config,
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
      await configForItem.resolveData(item, { changed, lastData: oldItem });

    const { readOnly: existingReadOnly = {} } = item || {};

    const newReadOnly = { ...existingReadOnly, ...readOnly };

    const resolvedItem = {
      ...item,
      props: {
        ...item.props,
        ...resolvedProps,
      },
    };

    if (Object.keys(newReadOnly).length) {
      resolvedItem.readOnly = newReadOnly;
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
