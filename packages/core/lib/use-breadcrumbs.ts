import { useMemo } from "react";
import { useAppStore } from "../stores/app-store";
import { ItemSelector } from "./get-item";
import { useNodeStore } from "../stores/node-store";

export type Breadcrumb = {
  label: string;
  selector: ItemSelector | null;
  zoneCompound?: string;
};

export const useBreadcrumbs = (renderCount?: number) => {
  const selectedId = useAppStore((s) => s.selectedItem?.props.id);
  const config = useAppStore((s) => s.config);
  const path = useNodeStore((s) => s.nodes[selectedId]?.path);

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

        const node = useNodeStore.getState().nodes[componentId];

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
