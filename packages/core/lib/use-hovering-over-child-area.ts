import { useContext, useEffect, useState } from "react";
import { dropZoneContext } from "../components/DropZone";
import { isChildOfArea } from "./is-child-of-area";
import { DropZoneContext } from "../components/DropZone/context";

export const useHoveringOverChildArea = () => {
  const ctx = useContext(dropZoneContext);

  const [hoveringOverChildArea, setHoveringOverChildArea] = useState(false);

  const { hoveringComponent = "" } = ctx || {};

  // TODO (Perf): this gets called on every component on the page whenever hover state changes
  useEffect(() => {
    const areaId = (ctx || {}).areaId || "root";

    if (hoveringComponent) {
      // Everything is inside root
      if (areaId === "root" && hoveringComponent !== "root") {
        setHoveringOverChildArea(true);

        return;

        // Otherwise, check if the hovered area exists within the current area
      } else if (
        areaId !== hoveringComponent &&
        isChildOfArea(areaId, hoveringComponent, ctx)
      ) {
        setHoveringOverChildArea(true);

        return;
      }
    }

    setHoveringOverChildArea(false);
  }, [hoveringComponent]);

  return hoveringOverChildArea;
};
