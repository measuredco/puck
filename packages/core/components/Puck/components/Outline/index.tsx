import { areaContainsZones } from "../../../../lib/area-contains-zones";
import { findZonesForArea } from "../../../../lib/find-zones-for-area";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { LayerTree } from "../../../LayerTree";
import { useAppContext } from "../../context";
import { dropZoneContext } from "../../../DropZone";
import { useCallback } from "react";
import { ItemSelector } from "../../../../lib/get-item";

export const Outline = () => {
  const { dispatch, state } = useAppContext();
  const { data, ui } = state;
  const { itemSelector } = ui;

  const setItemSelector = useCallback(
    (newItemSelector: ItemSelector | null) => {
      dispatch({
        type: "setUi",
        ui: { itemSelector: newItemSelector },
      });
    },
    []
  );

  return (
    <div>
      <dropZoneContext.Consumer>
        {(ctx) => (
          <>
            {ctx?.activeZones && ctx?.activeZones[rootDroppableId] && (
              <LayerTree
                data={data}
                label={areaContainsZones(data, "root") ? rootDroppableId : ""}
                zoneContent={data.content}
                setItemSelector={setItemSelector}
                itemSelector={itemSelector}
              />
            )}
            {Object.entries(findZonesForArea(data, "root")).map(
              ([zoneKey, zone]) => {
                return (
                  <LayerTree
                    key={zoneKey}
                    data={data}
                    label={zoneKey}
                    zone={zoneKey}
                    zoneContent={zone}
                    setItemSelector={setItemSelector}
                    itemSelector={itemSelector}
                  />
                );
              }
            )}
          </>
        )}
      </dropZoneContext.Consumer>
    </div>
  );
};
