import { ComponentData, CurrentData, RootData } from "../types/Config";

export const applyDynamicProps = (
  data: CurrentData,
  dynamicProps: Record<string, ComponentData>,
  rootData?: RootData
) => {
  return {
    ...data,
    root: {
      ...data.root,
      ...(rootData ? rootData : {}),
    },
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
