import { areaContainsZones } from "../../../../lib/area-contains-zones";
import { findZonesForArea } from "../../../../lib/find-zones-for-area";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { LayerTree } from "../../../LayerTree";
import { useAppStore, useAppStoreApi } from "../../../../store";
import { dropZoneContext } from "../../../DropZone";
import { useCallback, useMemo } from "react";
import { ItemSelector } from "../../../../lib/get-item";

export const Outline = () => {
  const state = useAppStore((s) => s.state); // Perf: Will cause re-render whenever any state changes
  const config = useAppStore((s) => s.config);
  const outlineOverride = useAppStore((s) => s.overrides.outline);
  const { data, ui } = state;
  const { itemSelector } = ui;
  const appStore = useAppStoreApi();

  const setItemSelector = useCallback(
    (newItemSelector: ItemSelector | null) => {
      const { dispatch } = appStore.getState();

      dispatch({
        type: "setUi",
        ui: { itemSelector: newItemSelector },
      });
    },
    [appStore]
  );

  const Wrapper = useMemo(() => outlineOverride || "div", [outlineOverride]);
  return (
    <Wrapper>
      <dropZoneContext.Consumer>
        {(ctx) => (
          <>
            {ctx?.activeZones && ctx?.activeZones[rootDroppableId] && (
              <LayerTree
                config={config}
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
                    config={config}
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
    </Wrapper>
  );
};
