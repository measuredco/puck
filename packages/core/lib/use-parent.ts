import { useContext } from "react";
import { useAppContext } from "../components/Puck/context";
import { getItem, ItemSelector } from "./get-item";
import { dropZoneContext } from "../components/DropZone";
import { convertPathDataToBreadcrumbs } from "./use-breadcrumbs";

export const useParent = (itemSelector?: ItemSelector) => {
  const { selectedItem, state } = useAppContext();
  const { pathData } = useContext(dropZoneContext) || {};
  const item = itemSelector ? getItem(itemSelector, state.data) : selectedItem;
  const breadcrumbs = convertPathDataToBreadcrumbs(item, pathData, state.data);

  const lastItem = breadcrumbs[breadcrumbs.length - 1];
  const parent = lastItem?.selector
    ? getItem(lastItem.selector, state.data) ?? null
    : null;

  return parent || null;
};
