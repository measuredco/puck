import { Config, MappedItem } from "../types/Config";

const lastChangeCache = {};

export const resolveAllProps = async (
  content: MappedItem[],
  config: Config
) => {
  return await Promise.all(
    content.map(async (item) => {
      const configForItem = config.components[item.type];

      if (configForItem.resolveProps) {
        if (lastChangeCache[item.props.id]) {
          const { item: oldItem, resolved } = lastChangeCache[item.props.id];

          if (oldItem === item) {
            return resolved;
          }
        }
        const { props: resolvedProps, readOnly = {} } =
          await configForItem.resolveProps(item.props);

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

        return resolvedItem;
      }

      return item;
    })
  );
};
