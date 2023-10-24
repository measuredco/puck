import { Config, MappedItem } from "../types/Config";

export const resolveAllProps = async (
  content: MappedItem[],
  config: Config
) => {
  return await Promise.all(
    content.map(async (item) => {
      const configForItem = config.components[item.type];

      if (configForItem.resolveProps) {
        const { props: resolvedProps, readOnly = {} } =
          await configForItem.resolveProps(item.props);

        const { _meta: { readOnly: existingReadOnly = {} } = {} } =
          item.props || {};

        return {
          ...item,
          props: {
            ...resolvedProps,
            _meta: { readOnly: { ...existingReadOnly, ...readOnly } },
          },
        };
      }

      return item;
    })
  );
};
