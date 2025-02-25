import { useCallback, useContext } from "react";
import { useAppContext } from "../components/Puck/context";
import { getItem, ItemSelector } from "./get-item";
import { dropZoneContext } from "../components/DropZone";
import { convertPathDataToBreadcrumbs } from "./use-breadcrumbs";
import { PathData } from "../components/DropZone/context";
import { Data } from "../types";

export const getParent = (
  itemSelector: ItemSelector | null,
  pathData: PathData | undefined,
  data: Data
) => {
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
  const { state } = useAppContext();
  const { pathData } = useContext(dropZoneContext) || {};

  return useCallback(
    () => getParent(state.ui.itemSelector, pathData, state.data),
    [state.ui.itemSelector, pathData, state.data]
  );
};

export const useParent = () => {
  return useGetParent()();
};
