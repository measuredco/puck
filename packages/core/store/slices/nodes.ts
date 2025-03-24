import { StoreApi } from "zustand";
import { ComponentData, Data } from "../../types";
import deepEqual from "fast-deep-equal";
import { useEffect } from "react";
import { AppStore, useAppStoreApi } from "../";
import { rootAreaId, rootDroppableId } from "../../lib/root-droppable-id";
import { forAllData } from "../../lib/for-all-data";
import { ZoneType } from "./zones";

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
  parentId: string | null;
  zone: string;
  path: string[];
  index: number;
  element: HTMLElement | null;
  zoneType: ZoneType;
};

export const generateNodesSlice = (
  data: Data,
  appStore: StoreApi<AppStore>
) => {
  const nodeIndex: Record<
    string,
    {
      data: ComponentData;
      parentId: string;
      zone: string;
      path: string[];
      index: number;
      zoneType: ZoneType;
    }
  > = {};

  const config = appStore.getState().config;

  forAllData(
    data,
    (data, parentId, zone, index, zoneType) => {
      nodeIndex[data.props.id] = {
        data,
        parentId,
        zone,
        path: [],
        index,
        zoneType,
      };
    },
    config
  );

  const nodes = appStore.getState().nodes;

  const registerNode = nodes.registerNode;

  Object.keys(nodeIndex).forEach((componentId) => {
    const details = nodeIndex[componentId];

    let currentDetails = details;
    let path = [];

    while (currentDetails && currentDetails?.parentId !== rootAreaId) {
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
  Object.keys(nodes.nodes).forEach((key) => {
    if (!nodeIndex[key] && key !== "root") {
      nodes.unregisterNode(key);
    }
  });
};

export type NodesSlice = {
  nodes: Record<string, PuckNode | undefined>;
  registerNode: (id: string, node: Partial<PuckNode>) => void;
  unregisterNode: (id: string, node?: Partial<PuckNode>) => void;
};

export const createNodesSlice = (
  set: (newState: Partial<AppStore>) => void,
  get: () => AppStore
): NodesSlice => ({
  nodes: {},
  registerNode: (id: string, node: Partial<PuckNode>) => {
    const s = get().nodes;

    // Only update node if it changes
    if (s.nodes[id] && partialDeepEqual(node, s.nodes[id])) {
      return;
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
      zoneType: "root",
    };

    const existingNode: PuckNode | undefined = s.nodes[id];

    set({
      nodes: {
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
      },
    });
  },
  unregisterNode: (id) => {
    const s = get().nodes;
    const existingNode: PuckNode | undefined = s.nodes[id];

    if (existingNode) {
      const newNodes = { ...s.nodes };

      delete newNodes[id];

      set({
        nodes: {
          ...s,
          nodes: newNodes,
        },
      });
    }
  },
});

/**
 * Reindex the entire tree whenever the state changes
 */
export const useRegisterNodesSlice = (
  appStore: ReturnType<typeof useAppStoreApi>
) => {
  useEffect(() => {
    return appStore.subscribe(
      (s) => s.state.data,
      (data) => generateNodesSlice(data, appStore)
    );
  }, []);
};
