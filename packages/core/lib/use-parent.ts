import { useCallback } from "react";
import { useAppContext } from "../components/Puck/context";
import { getItem, ItemSelector } from "./get-item";
import { convertPathDataToBreadcrumbs } from "./use-breadcrumbs";
import { PathData } from "../components/DropZone/context";
import { ComponentData, Data } from "../types";

export const getParentByItem = (
  item: ComponentData | undefined,
  pathData: PathData | undefined,
  data: Data
) => {
  const breadcrumbs = convertPathDataToBreadcrumbs(item, pathData, data);

  const lastItem = breadcrumbs[breadcrumbs.length - 1];
  const parent = lastItem?.selector
    ? getItem(lastItem.selector, data) ?? null
    : null;

  return parent || null;
};

export const getParent = (
  itemSelector: ItemSelector | null,
  pathData: PathData | undefined,
  data: Data
) => {
  if (!itemSelector) return null;

  const item = getItem(itemSelector, data);

  return getParentByItem(item, pathData, data);
};

export const useGetParent = () => {
  const { state, pathData } = useAppContext();

  return useCallback(
    (itemSelector: ItemSelector | null) =>
      getParent(itemSelector, pathData, state.data),
    [pathData, state.data]
  );
};

export const useGetParentByItem = () => {
  const { state, pathData } = useAppContext();

  return useCallback(
    (item: ComponentData | undefined) =>
      getParentByItem(item, pathData, state.data),
    [pathData, state.data]
  );
};

export const useParent = () => {
  const { state } = useAppContext();

  return useGetParent()(state.ui.itemSelector);
};
