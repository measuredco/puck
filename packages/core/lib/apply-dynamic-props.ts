import { Data } from "../types/Config";

export const applyDynamicProps = (
  data: Data,
  dynamicProps: Record<string, any>
) => {
  return {
    ...data,
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
