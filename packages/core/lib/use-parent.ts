import { useAppStore, useAppStoreApi } from "../store";

export const useParent = () => {
  const appStore = useAppStoreApi();

  const selectedItem = appStore.getState().selectedItem;
  const parent = useAppStore((s) => {
    const node = s.nodes.nodes[selectedItem?.props.id];
    return node?.parentId ? s.nodes.nodes[node.parentId] : null;
  });

  return parent?.data ?? null;
};
