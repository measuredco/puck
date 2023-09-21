import { DropZoneContext } from "../components/DropZone/context";
import { Content } from "../types/Config";
import { getItem } from "./get-item";

export const isChildOfZone = (
  item: Content[0],
  maybeChild: Content[0] | null | undefined,
  ctx: DropZoneContext
) => {
  const { data, pathData = {} } = ctx || {};

  return maybeChild && data
    ? !!pathData[maybeChild.props.id]?.find((path) => {
        if (path.selector) {
          const pathItem = getItem(path.selector!, data);

          return pathItem?.props.id === item.props.id;
        }

        return false;
      })
    : false;
};
