import { useNodeStore } from "../stores/node-store";
import { ComponentData, Data, RootData } from "../types";
import { rootDroppableId } from "./root-droppable-id";

/**
 * Apply the provided data to the Puck data payload.
 *
 * Modifies in-place, retains references to avoid re-renders.
 */
export const applyDynamicProps = (
  data: Data,
  dynamicProps: Record<string, ComponentData>,
  rootData?: RootData
) => {
  if (data.root.props && rootData) {
    Object.assign(data.root.props, rootData.props);
    Object.assign(data.root.readOnly || {}, rootData.readOnly);
  }

  Object.entries(dynamicProps).forEach(([id, item]) => {
    const node = useNodeStore.getState().nodes[id];

    const zoneCompound = `${node.parentId}:${node.zone}`;

    if (zoneCompound === rootDroppableId) {
      Object.assign(data.content[node.index].props, item.props);
      Object.assign(data.content[node.index].readOnly || {}, item.readOnly);
    } else if (data.zones) {
      Object.assign(data.zones[zoneCompound][node.index].props, item.props);
      Object.assign(
        data.zones[zoneCompound][node.index].readOnly || {},
        item.readOnly
      );
    }
  });

  return data;
};
