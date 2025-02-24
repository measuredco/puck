import { useAppStore } from "../stores/app-store";
import { Data } from "../types";
import { rootDroppableId } from "./root-droppable-id";
import { setupZone } from "./setup-zone";

export type ItemSelector = {
  index: number;
  zone?: string;
};

export function getItem<UserData extends Data>(
  selector: ItemSelector,
  data?: UserData,
  dynamicProps: Record<string, any> = {}
): UserData["content"][0] | undefined {
  const _data = data ?? useAppStore.getState().state.data;

  if (!_data) return;

  if (!selector.zone || selector.zone === rootDroppableId) {
    const item = _data.content[selector.index];

    return item?.props
      ? { ...item, props: dynamicProps[item.props.id] || item.props }
      : undefined;
  }

  const item = setupZone(_data, selector.zone).zones[selector.zone][
    selector.index
  ];

  return item?.props
    ? { ...item, props: dynamicProps[item.props.id] || item.props }
    : undefined;
}
