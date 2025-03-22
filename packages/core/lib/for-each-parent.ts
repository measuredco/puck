import { ComponentData } from "../types";
import { PrivateAppState, PuckNodeData } from "../types/Internal";

export const forEachParent = (
  state: PrivateAppState,
  componentData: ComponentData,
  cb: (
    parentId: string,
    slotId: string,
    parentNode: PuckNodeData | undefined
  ) => void
) => {
  const node = state.indexes.nodes[componentData.props.id];

  if (node) {
    node.path.reverse().forEach((zoneCompound) => {
      const [parentId, slotId] = zoneCompound.split(":");

      const zone = state.indexes.zones[zoneCompound];

      if (zone) {
        if (zone && zone.type === "slot") {
          cb(parentId, slotId, state.indexes.nodes[parentId]);
        }
      }
    });
  }
};
