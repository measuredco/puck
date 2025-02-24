import { create } from "zustand";
import { ComponentData } from "../types";
import deepEqual from "fast-deep-equal";
import { subscribeWithSelector } from "zustand/middleware";
import { useEffect } from "react";
import { useAppStore } from "../stores/app-store";
import {
  rootAreaId,
  rootDroppableId,
  rootZone,
} from "../lib/root-droppable-id";

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

type NodeStore = {
  nodes: Record<string, PuckNode | undefined>;
  registerNode: (id: string, node: Partial<PuckNode>) => void;
  unregisterNode: (id: string, node?: Partial<PuckNode>) => void;
};

export const useNodeStore = create<NodeStore>()(
  subscribeWithSelector((set) => ({
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
    unregisterNode: (id: string) => {
      set((s) => {
        const existingNode: PuckNode | undefined = s.nodes[id];

        if (existingNode) {
          const newNodes = { ...s.nodes };

          delete newNodes[id];

          return {
            ...s,
            nodes: newNodes,
          };
        }

        return s;
      });
    },
  }))
);

/**
 * Reindex the entire tree whenever the state changes
 */
export const useRegisterNodeStore = () => {
  useEffect(() => {
    return useAppStore.subscribe(
      (s) => s.state.data,
      (data) => {
        const nodeIndex: Record<
          string,
          {
            data: ComponentData;
            parentId: string;
            zone: string;
            path: string[];
            index: number;
          }
        > = {};

        const forAllData = (
          cb: (
            data: ComponentData,
            parentId: string,
            zone: string,
            index: number
          ) => void
        ) => {
          data.content.forEach((data, index) => {
            cb(data, rootAreaId, rootZone, index);
          });

          Object.entries(data.zones || {}).forEach(
            ([zoneCompound, content]) => {
              const [parentId, zone] = zoneCompound.split(":");

              content.forEach((data, index) => {
                cb(data, parentId, zone, index);
              });
            }
          );
        };

        forAllData((data, parentId, zone, index) => {
          nodeIndex[data.props.id] = { data, parentId, zone, path: [], index };
        });

        const nodeStore = useNodeStore.getState();

        const registerNode = nodeStore.registerNode;

        Object.keys(nodeIndex).forEach((componentId) => {
          const details = nodeIndex[componentId];

          let currentDetails = details;
          let path = [];

          while (currentDetails?.parentId !== rootAreaId) {
            path.unshift(`${currentDetails.parentId}:${currentDetails.zone}`);
            currentDetails = nodeIndex[currentDetails.parentId];
          }

          path.unshift(rootDroppableId);

          nodeIndex[componentId].path = path;

          registerNode(componentId, nodeIndex[componentId]);
        });

        // DEPRECATED
        const rootProps = data.root.props || data.root;

        registerNode("root", {
          data: { type: "root", props: { id: "root", ...rootProps } },
        });

        // Remove old nodes
        Object.keys(nodeStore.nodes).forEach((key) => {
          if (!nodeIndex[key] && key !== "root") {
            nodeStore.unregisterNode(key);
          }
        });
      }
    );
  }, []);
};
