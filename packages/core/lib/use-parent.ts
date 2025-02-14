import { useCallback, useContext } from "react";
import { getAppStore } from "../components/Puck/context";
import { getItem } from "./get-item";
import { dropZoneContext } from "../components/DropZone";
import { convertPathDataToBreadcrumbs } from "./use-breadcrumbs";
import { PathData } from "../components/DropZone/context";

export const getParent = (pathData: PathData | undefined) => {
  const {
    data,
    ui: { itemSelector },
  } = getAppStore().state;

  if (!itemSelector) return null;

  const item = getItem(itemSelector, data);
  const breadcrumbs = convertPathDataToBreadcrumbs(item, pathData, data);

  const lastItem = breadcrumbs[breadcrumbs.length - 1];
  const parent = lastItem?.selector
    ? getItem(lastItem.selector, data) ?? null
    : null;

  return parent || null;
};

export const useGetParent = () => {
  const { pathData } = useContext(dropZoneContext) || {};

  return useCallback(() => getParent(pathData), [pathData]);
};

export const useParent = () => {
  return useGetParent()();
};
