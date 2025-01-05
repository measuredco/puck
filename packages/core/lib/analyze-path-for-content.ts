import { Config, Content, Path } from "../types";

export const analyzePathsForContent = (
  config: Config,
  content: Content,
  path: Path,
  propName: string,
  parentId?: string
) => {
  return content.reduce((acc, item, index) => {
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
          ...analyzePathsForContent(
            config,
            item.props[propKey],
            pathForNode,
            propKey,
            item.props.id
          ),
        };
      }
    }

    return {
      ...acc,
      ...childNodes,
      [item.props.id]: pathForNode,
    };
  }, {});
};
