import { useCallback, useState } from "react";
import { PathData } from "../components/DropZone/context";
import { ItemSelector } from "./get-item";
import { getZoneId } from "./get-zone-id";
import { Data } from "../types";

export const usePathData = (data: Data) => {
  const [pathData, setPathData] = useState<PathData>();

  const registerPath = useCallback(
    (id: string, selector: ItemSelector, label: string) => {
      const [area] = getZoneId(selector.zone);

      setPathData((latestPathData = {}) => {
        const parentPathData = latestPathData[area] || { path: [] };

        return {
          ...latestPathData,
          [id]: {
            path: [
              ...parentPathData.path,
              ...(selector.zone ? [selector.zone] : []),
            ],
            label: label,
          },
        };
      });
    },
    [data, setPathData]
  );

  const unregisterPath = useCallback(
    (id: string) => {
      setPathData((latestPathData = {}) => {
        const newPathData = { ...latestPathData };

        delete newPathData[id];

        return newPathData;
      });
    },
    [data, setPathData]
  );

  return { pathData, registerPath, unregisterPath };
};
