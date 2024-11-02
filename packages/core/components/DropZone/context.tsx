import { ReactNode, createContext, useCallback, useState } from "react";
import { Config, Data } from "../../types";
import { ItemSelector } from "../../lib/get-item";

import { PuckAction } from "../../reducer";
import type { Draggable } from "@dnd-kit/dom";

export type PathData = Record<string, { path: string[]; label: string }>;

export type DropZoneContext<UserConfig extends Config = Config> = {
  data: Data;
  config: UserConfig;
  componentState?: Record<string, any>;
  itemSelector?: ItemSelector | null;
  setItemSelector?: (newIndex: ItemSelector | null) => void;
  dispatch?: (action: PuckAction) => void;
  areaId?: string;
  zoneCompound?: string;
  index?: number;
  draggedItem?: Draggable | null;
  hoveringComponent?: string | null;
  setHoveringComponent?: (id: string | null) => void;
  registerZoneArea?: (areaId: string) => void;
  areasWithZones?: Record<string, boolean>;
  registerZone?: (zoneCompound: string) => void;
  unregisterZone?: (zoneCompound: string) => void;
  activeZones?: Record<string, boolean>;
  pathData?: PathData;
  registerPath?: (selector: ItemSelector) => void;
  mode?: "edit" | "render";
  depth: number;
  registerLocalZone?: (zone: string, active: boolean) => void; // A zone as it pertains to the current area
  deepestZone?: string | null;
  deepestArea?: string | null;
  path: string[];
} | null;

export const dropZoneContext = createContext<DropZoneContext>(null);

export const DropZoneProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: DropZoneContext;
}) => {
  // Hovering component may match area, but areas must always contain zones
  const [hoveringComponent, setHoveringComponent] = useState<string | null>();

  const [areasWithZones, setAreasWithZones] = useState<Record<string, boolean>>(
    {}
  );

  const [activeZones, setActiveZones] = useState<Record<string, boolean>>({});

  const { dispatch = null } = value ? value : {};

  const registerZoneArea = useCallback(
    (area: string) => {
      setAreasWithZones((latest) => ({ ...latest, [area]: true }));
    },
    [setAreasWithZones]
  );

  const registerZone = useCallback(
    (zoneCompound: string) => {
      if (!dispatch) {
        return;
      }

      dispatch({
        type: "registerZone",
        zone: zoneCompound,
      });

      setActiveZones((latest) => ({ ...latest, [zoneCompound]: true }));
    },
    [setActiveZones, dispatch]
  );

  const unregisterZone = useCallback(
    (zoneCompound: string) => {
      if (!dispatch) {
        return;
      }

      dispatch({
        type: "unregisterZone",
        zone: zoneCompound,
      });

      setActiveZones((latest) => ({
        ...latest,
        [zoneCompound]: false,
      }));
    },
    [setActiveZones, dispatch]
  );

  return (
    <>
      {value && (
        <dropZoneContext.Provider
          value={{
            hoveringComponent,
            setHoveringComponent,
            registerZoneArea,
            areasWithZones,
            registerZone,
            unregisterZone,
            activeZones,
            ...value,
          }}
        >
          {children}
        </dropZoneContext.Provider>
      )}
    </>
  );
};
