import { Config, MappedItem } from "../types/Config";

const lastChangeCache = {};

export const resolveAllProps = async (
  content: MappedItem[],
  config: Config,
  onResolveStart?: (item: MappedItem) => void,
  onResolveEnd?: (item: MappedItem) => void
) => {
  return await Promise.all(
    content.map(async (item) => {
      const configForItem = config.components[item.type];

      if (configForItem.resolveProps) {
        let changed = Object.keys(item.props).reduce(
          (acc, item) => ({ ...acc, [item]: true }),
          {}
        );

        if (lastChangeCache[item.props.id]) {
          const { item: oldItem, resolved } = lastChangeCache[item.props.id];

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
          await configForItem.resolveProps(item.props, { changed });

        const { _meta: { readOnly: existingReadOnly = {} } = {} } =
          item.props || {};

        const resolvedItem = {
          ...item,
          props: {
            ...resolvedProps,
            _meta: { readOnly: { ...existingReadOnly, ...readOnly } },
          },
        };

        lastChangeCache[item.props.id] = {
          item,
          resolved: resolvedItem,
        };

        if (onResolveEnd) {
          onResolveEnd(resolvedItem);
        }

        return resolvedItem;
      }

      return item;
    })
  );
};
