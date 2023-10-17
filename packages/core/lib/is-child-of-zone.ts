import { DropZoneContext } from "../components/DropZone/context";
import { Content } from "../types/Config";
import { getItem } from "./get-item";
import { getZoneId } from "./get-zone-id";

export const isChildOfZone = (
  item: Content[0],
  maybeChild: Content[0] | null | undefined,
  ctx: DropZoneContext
) => {
  const { data, pathData = {} } = ctx || {};

  return maybeChild && data
    ? !!pathData[maybeChild.props.id]?.path.find((zoneCompound) => {
        const [area] = getZoneId(zoneCompound);

        return area === item.props.id;
      })
    : false;
};
