import { useEffect } from "react";
import { useAppStore } from "../stores/app-store";
import { ComponentData } from "../types";
import { rootAreaId, rootDroppableId, rootZone } from "./root-droppable-id";
import { useNodeStore } from "../stores/node-store";

/**
 * Reindex the entire tree whenever the state changes
 */
export const useMonitorNodeIndex = () => {
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
