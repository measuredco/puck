import { ComponentData, Data, RootData } from "../types";

/**
 * Apply the provided data to the Puck data payload.
 *
 * Modifies in-place, retains references to avoid re-renders.
 */
export const applyDynamicProps = (
  data: Data,
  dynamicProps: Record<string, ComponentData>,
  rootData?: RootData
) => {
  return dataMap(data, (item) => {
    if (!item.props) {
      return item;
    }

    if ("id" in item.props) {
      return {
        ...item,
        ...dynamicProps[item.props.id],
      };
    } else {
      return { ...item, ...rootData };
    }
  });
};
