import { ComponentData, Config, MappedItem } from "../types/Config";

export const cache = { lastChange: {} };

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
    let changed = Object.keys(item.props).reduce(
      (acc, item) => ({ ...acc, [item]: true }),
      {}
    );

    if (cache.lastChange[item.props.id]) {
      const { item: oldItem, resolved } = cache.lastChange[item.props.id];

      if (oldItem === item) {
        return resolved;
      }

      Object.keys(item.props).forEach((propName) => {
        if (oldItem.props[propName] === item.props[propName]) {
          changed[propName] = false;
        }
      });
    }

    if (onResolveStart) {
      onResolveStart(item);
    }

    const { props: resolvedProps, readOnly = {} } =
      await configForItem.resolveData(item, { changed });

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
