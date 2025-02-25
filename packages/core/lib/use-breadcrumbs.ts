import { useContext, useMemo } from "react";
import { dropZoneContext, PathData } from "../components/DropZone/context";
import { useAppContext } from "../components/Puck/context";
import { getZoneId } from "./get-zone-id";
import { rootDroppableId } from "./root-droppable-id";
import { ItemSelector } from "./get-item";
import { Data, MappedItem } from "../types";

export type Breadcrumb = {
  label: string;
  selector: ItemSelector | null;
  zoneCompound?: string;
};

export const convertPathDataToBreadcrumbs = (
  selectedItem: MappedItem | undefined,
  pathData: PathData | undefined,
  data: Data
) => {
  const id = selectedItem ? selectedItem?.props.id : "";

  const currentPathData =
    pathData && id && pathData[id]
      ? { ...pathData[id] }
      : { label: "Page", path: [] };

  if (!id) {
    return [];
  }

  return currentPathData?.path.reduce<Breadcrumb[]>((acc, zoneCompound) => {
    const [area] = getZoneId(zoneCompound);

    if (area === rootDroppableId) {
      return [
        {
          label: "Page",
          selector: null,
        },
      ];
    }

    const parentZoneCompound =
      acc.length > 0 ? acc[acc.length - 1].zoneCompound : rootDroppableId;

    let parentZone = data.content;

    if (parentZoneCompound && parentZoneCompound !== rootDroppableId) {
      parentZone = data.zones![parentZoneCompound];
    }

    if (!parentZone) {
      return acc;
    }

    const itemIndex = parentZone.findIndex(
      (queryItem) => queryItem.props.id === area
    );

    const item = parentZone[itemIndex];

    if (!item) {
      return acc;
    }

    return [
      ...acc,
      {
        label: item.type.toString(),
        selector: {
          index: itemIndex,
          zone: parentZoneCompound,
        },
        zoneCompound: zoneCompound,
      },
    ];
  }, []);
};

export const useBreadcrumbs = (renderCount?: number) => {
  const {
    state: { data },
    selectedItem,
  } = useAppContext();
  const dzContext = useContext(dropZoneContext);

  return useMemo<Breadcrumb[]>(() => {
    const breadcrumbs = convertPathDataToBreadcrumbs(
      selectedItem,
      dzContext?.pathData,
      data
    );

    if (renderCount) {
      return breadcrumbs.slice(breadcrumbs.length - renderCount);
    }

    return breadcrumbs;
  }, [selectedItem, dzContext?.pathData, renderCount]);
};
