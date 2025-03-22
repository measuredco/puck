import { ComponentData } from "../types";
import { NodeIndex, PrivateAppState, ZoneIndex } from "../types/Internal";
import { forEachSlot } from "./for-each-slot";
import { forRelatedZones } from "./for-related-zones";

export const deindex = (
  state: PrivateAppState,
  componentData: ComponentData
) => {
  let zones: ZoneIndex = { ...state.indexes.zones };
  let nodes: NodeIndex = { ...state.indexes.nodes };

  const dindexRelatedZones = (item: ComponentData) => {
    forRelatedZones(item, state.data, (_path, zoneCompound, content) => {
      content.forEach((subItem) => {
        dindexChildren(subItem);
        delete nodes[subItem.props.id];
      });

      delete zones[zoneCompound];
    });
  };

  const dindexChildren = (item: ComponentData) => {
    forEachSlot(
      item,
      (parentId, slotId, content) => {
        const zoneCompound = `${parentId}:${slotId}`;

        delete zones[zoneCompound];

        content.forEach((item) => {
          dindexRelatedZones(item);

          delete nodes[item.props.id];
        });
      },
      true
    );
  };

  dindexRelatedZones(componentData);
  dindexChildren(componentData);

  delete nodes[componentData.props.id];

  return { nodes, zones };
};
