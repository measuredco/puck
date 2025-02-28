import { useMemo } from "react";
import { useAppStore, useAppStoreApi } from "../store";
import { ItemSelector } from "./get-item";

export type Breadcrumb = {
  label: string;
  selector: ItemSelector | null;
  zoneCompound?: string;
};

export const useBreadcrumbs = (renderCount?: number) => {
  const selectedId = useAppStore((s) => s.selectedItem?.props.id);
  const config = useAppStore((s) => s.config);
  const path = useAppStore((s) => s.nodes.nodes[selectedId]?.path);
  const appStore = useAppStoreApi();

  return useMemo<Breadcrumb[]>(() => {
    const breadcrumbs =
      path?.map((zoneCompound) => {
        const [componentId] = zoneCompound.split(":");

        if (componentId === "root") {
          return {
            label: "Page",
            selector: null,
          };
        }

        const node = appStore.getState().nodes.nodes[componentId];

        const label = node
          ? config.components[node.data.type]?.label ?? node.data.type
          : "Component";

        return {
          label,
          selector: node
            ? {
                index: node.index,
                zone: node.path[node.path.length - 1],
              }
            : null,
        };
      }) || [];

    if (renderCount) {
      return breadcrumbs.slice(breadcrumbs.length - renderCount);
    }

    return breadcrumbs;
  }, [path, renderCount]);
};
