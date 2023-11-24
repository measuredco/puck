import { CurrentData } from "../types/Config";
import { rootDroppableId } from "./root-droppable-id";
import { setupZone } from "./setup-zone";

export type ItemSelector = {
  index: number;
  zone?: string;
};

export const getItem = (
  selector: ItemSelector,
  data: CurrentData,
  dynamicProps: Record<string, any> = {}
): CurrentData["content"][0] | undefined => {
  if (!selector.zone || selector.zone === rootDroppableId) {
    const item = data.content[selector.index];

    return { ...item, props: dynamicProps[item.props.id] || item.props };
  }

  const item = setupZone(data, selector.zone).zones[selector.zone][
    selector.index
  ];

  return { ...item, props: dynamicProps[item.props.id] || item.props };
};
