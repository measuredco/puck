import { getAppStore } from "../stores/app-store";
import { useNodeStore } from "../stores/node-store";

export const useParent = () => {
  const selectedItem = getAppStore().selectedItem;
  const parent = useNodeStore((s) => {
    const node = s.nodes[selectedItem?.props.id];
    return node ? s.nodes[node.parentId] : null;
  });

  return parent?.data ?? null;
};
