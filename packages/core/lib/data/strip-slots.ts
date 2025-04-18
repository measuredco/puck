import { isSlot } from "./is-slot";
import { ComponentData } from "../../types";

export const stripSlots = (data: ComponentData): ComponentData => {
  // Strip out slots to prevent re-renders of parents when child changes
  return {
    ...data,
    props: Object.entries(data.props).reduce(
      (acc, [propKey, propVal]) => {
        if (isSlot(propVal)) {
          return acc;
        }

        return { ...acc, [propKey]: propVal };
      },
      { id: data.props.id }
    ),
  };
};
