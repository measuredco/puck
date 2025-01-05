import { AppState, Config, Content, Data, Path } from "../types";
import { DataIndex, DataIndexItem } from "../stores/data-index";

export const generateDataIndex = (
  appState: AppState,
  config: Config
): DataIndex => {
  const recurse = (
    config: Config,
    content: Content,
    path: Path,
    propName: string,
    parentId?: string
  ) => {
    return content.reduce((acc, item, index) => {
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
            ...recurse(
              config,
              item.props[propKey],
              pathForNode,
              propKey,
              item.props.id
            ),
          };
        }
      }

      const dataIndexItem: DataIndexItem = {
        data: dataForNode,
        path: pathForNode,
        isSelected: appState.ui.itemSelector?.id === item.props.id,
      };

      const dataIndex: DataIndex = {
        ...acc,
        ...childNodes,
        [item.props.id as string]: dataIndexItem,
      };

      return dataIndex;
    }, {});
  };

  return recurse(config, appState.data.content, [], "content");
};
