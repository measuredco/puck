import { useNodeStore } from "../stores/node-store";
import { ComponentData, Data, RootData } from "../types";
import { rootDroppableId } from "./root-droppable-id";

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
  return {
    ...data,
    root: rootData
      ? {
          ...data.root,
          ...(rootData ? rootData : {}),
        }
      : data.root,
    content: data.content.map((item) => {
      return dynamicProps[item.props.id]
        ? { ...item, ...dynamicProps[item.props.id] }
        : item;
    }),
    zones: Object.keys(data.zones || {}).reduce((acc, zoneKey) => {
      return {
        ...acc,
        [zoneKey]: data.zones![zoneKey].map((item) => {
          return dynamicProps[item.props.id]
            ? { ...item, ...dynamicProps[item.props.id] }
            : item;
        }),
      };
    }, {}),
  };
};
