import { create } from "zustand";

type PuckNode = {
  id: string;
  sync: () => void;
};

export const useNodeStore = create<{
  nodes: Record<string, PuckNode>;
  registerNode: (node: PuckNode) => void;
  unregisterNode: (id: string) => void;
}>((set) => ({
  nodes: {},
  registerNode: (node: PuckNode) => {
    set((s) => ({
      ...s,
      nodes: { ...s.nodes, [node.id]: node },
    }));
  },
  unregisterNode: (id: string) => {
    set((s) => {
      const nodes = { ...s.nodes };

      delete nodes[id];

      return {
        ...s,
        nodes,
      };
    });
  },
}));
