import { ComponentData, Config } from "../types";
import {
  NodeIndex,
  PrivateAppState,
  PuckNodeData,
  PuckZoneData,
  ZoneType,
} from "../types/Internal";

import { rootAreaId, rootDroppableId } from "../lib/root-droppable-id";
import { forAllData } from "../lib/for-all-data";
import { flattenAllSlots, isSlot } from "../lib/flatten-slots";

import fdeq from "fast-deep-equal";

const stripSlots = (data: ComponentData): ComponentData => {
  // Strip out slots to prevent re-renders of parents when child changes
  return {
    ...data,
    props: Object.entries(data.props).reduce(
      (acc, [propKey, propVal]) => {
        if (isSlot(propVal)) {
          return acc;
        }

        return { ...acc, [propKey]: propVal };
      },
      { id: data.props.id }
    ),
  };
};

export const createNodeData = (
  {
    data,
    parentId,
    zone,
  }: {
    data: ComponentData;
    parentId: string;
    zone: string;
  },
  nodeIndex?: NodeIndex
): PuckNodeData => {
  const newItem: PuckNodeData = {
    data: data,
    flatData: stripSlots(data),
    parentId,
    zone,
    path: [],
  };

  if (nodeIndex) {
    newItem.path = [...nodeIndex[parentId].path, `${parentId}:${zone}`];
  }

  return newItem;
};

export const generateNodeIndex = (state: PrivateAppState, config: Config) => {
  const nodeIndex: NodeIndex = state.indexes.nodes;

  forAllData(
    state.data,
    (data, parentId, zone, index) => {
      const newItem = createNodeData({ data, parentId, zone });

      //   if (!fdeq(newItem, nodeIndex[data.props.id])) {
      nodeIndex[data.props.id] = newItem;
      //   }
    },
    config
  );

  const existingIndex = state.indexes.nodes;

  Object.keys(nodeIndex).forEach((componentId) => {
    const details = nodeIndex[componentId];

    // if (!fdeq(details, nodeIndex[componentId])) {
    //   return;
    // }

    let currentDetails: PuckNodeData | null = details;
    let path = [];

    while (currentDetails && currentDetails?.parentId !== rootAreaId) {
      path.unshift(`${currentDetails.parentId}:${currentDetails.zone}`);

      currentDetails = currentDetails.parentId
        ? nodeIndex[currentDetails.parentId]
        : null;
    }

    path.unshift(rootDroppableId);

    nodeIndex[componentId].path = path;
  });

  // DEPRECATED
  const rootProps = state.data.root.props || state.data.root;

  const rootData = { type: "root", props: { id: "root", ...rootProps } };

  nodeIndex["root"] = {
    data: rootData,
    flatData: stripSlots(rootData),
    parentId: null,
    zone: "",
    path: [],
  };

  // Remove old nodes
  Object.keys(existingIndex).forEach((key) => {
    if (!nodeIndex[key] && key !== "root") {
      delete nodeIndex[key];
    }
  });

  return nodeIndex;
};

export const generateZonesIndex = (state: PrivateAppState) => {
  const newIndex: Record<string, PuckZoneData> = state.indexes.zones;

  newIndex[rootDroppableId] = {
    contentIds: state.data.content.map((item) => item.props.id),
    type: "root",
  };

  Object.entries(state.data.zones || {}).forEach(([zoneCompound, content]) => {
    newIndex[zoneCompound] = {
      contentIds: content.map((item) => item.props.id),
      type: "dropzone",
    };
  });

  const allSlots = flattenAllSlots(state.data);

  Object.entries(allSlots).forEach(([zoneCompound, content]) => {
    newIndex[zoneCompound] = {
      contentIds: content.map((item) => item.props.id),
      type: "slot",
    };
  });

  return newIndex;
};
