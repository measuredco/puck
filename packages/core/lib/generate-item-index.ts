import { ComponentData, Config, Content, Data, Path } from "../types";

export const generateDataIndex = (
  config: Config,
  data: Data,
  path: Path,
  propName: string,
  parentId?: string
) => {
  return data.content.reduce((acc, item, index) => {
    const dataForNode = item;
    const pathForNode: Path = [...path, { propName, index, parentId }];

    let childNodes: Record<string, Path> = {};

    const configForItem = config.components[item.type];
    const propKeys = Object.keys(item.props);

    for (let i = 0; i < propKeys.length; i++) {
      const propKey = propKeys[i];

      const fieldForProp = configForItem.fields?.[propKey];

      if (fieldForProp?.type === "slot" && item.props[propKey]) {
        childNodes = {
          ...childNodes,
          ...generateDataIndex(
            config,
            item.props[propKey],
            path,
            propKey,
            item.props.id
          ),
        };
      }
    }

    return {
      ...acc,
      ...childNodes,
      [item.props.id]: {
        data: dataForNode,
        path: pathForNode,
      },
    };
  }, {});
};
