import { create } from "zustand";
import { ComponentData } from "../types";
import deepEqual from "fast-deep-equal";

const partialDeepEqual = (
  newItem: Record<string, any>,
  existingItem: Record<string, any>
) => {
  const filteredExistingItem = Object.keys(newItem).reduce(
    (acc, key) => ({ ...acc, [key]: existingItem[key] }),
    {}
  );

  return deepEqual(newItem, filteredExistingItem);
};

type NodeMethods = {
  sync: () => void;
};

type PuckNode = {
  id: string;
  methods: NodeMethods;
  data: ComponentData;
  parentId: string;
  zone: string;
  path: string[];
  index: number;
  element: HTMLElement | null;
};

export const useNodeStore = create<{
  nodes: Record<string, PuckNode>;
  registerNode: (id: string, node: Partial<PuckNode>) => void;
  unregisterNode: (id: string, node?: Partial<PuckNode>) => void;
}>((set) => ({
  nodes: {},
  registerNode: (id: string, node: Partial<PuckNode>) => {
    set((s) => {
      // Only update node if it changes
      if (s.nodes[id] && partialDeepEqual(node, s.nodes[id])) {
        return s;
      }

      const emptyNode: PuckNode = {
        id,
        methods: { sync: () => null },
        data: { props: { id }, type: "unknown" },
        parentId: "",
        zone: "",
        path: [],
        element: null,
        index: -1,
      };

      const existingNode: PuckNode | undefined = s.nodes[id];

      return {
        ...s,
        nodes: {
          ...s.nodes,
          [id]: {
            ...emptyNode,
            ...existingNode,
            ...node,
            id,
          },
        },
      };
    });
  },
  unregisterNode: (id: string, node?: Partial<PuckNode>) => {
    set((s) => {
      const existingNode: PuckNode | undefined = s.nodes[id];

      if (existingNode) {
        return {
          ...s,
          nodes: {
            ...s.nodes,
            [id]: {
              ...existingNode,
              ...node,
              id,
            },
          },
        };
      }

      return s;
    });
  },
}));
