import { ComponentData } from "../types";

export const getChanged = (
  newItem: Omit<Partial<ComponentData<any>>, "type"> | undefined,
  oldItem: Omit<Partial<ComponentData<any>>, "type"> | undefined
) => {
  return newItem
    ? Object.keys(newItem.props || {}).reduce((acc, item) => {
        const newItemProps = newItem?.props || {};
        const oldItemProps = oldItem?.props || {};

        return {
          ...acc,
          [item]: oldItemProps[item] !== newItemProps[item],
        };
      }, {})
    : {};
};
