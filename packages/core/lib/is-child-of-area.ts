import { DropZoneContext } from "../components/DropZone/context";
import { getItem } from "./get-item";

export const isChildOfArea = (
  areaId: string,
  childId: string | null | undefined,
  ctx: DropZoneContext
) => {
  const { data, pathData = {} } = ctx || {};

  // TODO perf create an index of pathData so we don't need to run a find
  // This may be inconsequential because the path is generally pretty short
  // unless the user is using many nested dropzones
  return childId && data
    ? !!pathData[childId]?.find((path) => {
        if (path.selector) {
          const pathItem = getItem(path.selector!, data);

          return pathItem?.props.id === areaId;
        }

        return false;
      })
    : false;
};
