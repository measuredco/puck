import {
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Config, Data, Metadata } from "../../types";
import { ItemSelector } from "../../lib/get-item";

import type { Draggable } from "@dnd-kit/dom";
import { useAppContext } from "../Puck/context";
import { createStore, StoreApi } from "zustand";

export type PathData = Record<string, { path: string[]; label: string }>;

export type DropZoneContext<UserConfig extends Config = Config> = {
  data: Data;
  config: UserConfig;
  componentState?: Record<string, any>;
  itemSelector?: ItemSelector | null;
  setItemSelector?: (newIndex: ItemSelector | null) => void;
  areaId?: string;
  zoneCompound?: string;
  index?: number;
  hoveringComponent?: string | null;
  setHoveringComponent?: (id: string | null) => void;
  registerZoneArea?: (areaId: string) => void;
  areasWithZones?: Record<string, boolean>;
  registerZone?: (zoneCompound: string) => void;
  unregisterZone?: (zoneCompound: string) => void;
  activeZones?: Record<string, boolean>;
  pathData?: PathData;
  registerPath?: (id: string, selector: ItemSelector, label: string) => void;
  unregisterPath?: (id: string) => void;
  mode?: "edit" | "render";
  depth: number;
  registerLocalZone?: (zone: string, active: boolean) => void; // A zone as it pertains to the current area
  unregisterLocalZone?: (zone: string) => void;
  path: string[];
  metadata: Metadata;
} | null;

export const dropZoneContext = createContext<DropZoneContext>(null);

export type Preview = {
  componentType: string;
  index: number;
  zone: string;
  props: Record<string, any>;
  type: "insert" | "move";
} | null;

export type ZoneStore = {
  zoneDepthIndex: Record<string, boolean>;
  areaDepthIndex: Record<string, boolean>;
  nextZoneDepthIndex: Record<string, boolean>;
  nextAreaDepthIndex: Record<string, boolean>;
  previewIndex: Record<string, Preview>;
  draggedItem?: Draggable | null;
};

export const ZoneStoreContext = createContext<StoreApi<ZoneStore>>(
  createStore(() => ({
    zoneDepthIndex: {},
    nextZoneDepthIndex: {},
    areaDepthIndex: {},
    nextAreaDepthIndex: {},
    draggedItem: null,
    previewIndex: {},
  }))
);

export const ZoneStoreProvider = ({
  children,
  store,
}: PropsWithChildren<{ store: StoreApi<ZoneStore> }>) => {
  return (
    <ZoneStoreContext.Provider value={store}>
      {children}
    </ZoneStoreContext.Provider>
  );
};

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

  const { dispatch } = useAppContext();

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

  const memoValue = useMemo(
    () =>
      ({
        hoveringComponent,
        setHoveringComponent,
        registerZoneArea,
        areasWithZones,
        registerZone,
        unregisterZone,
        activeZones,
        ...value,
      } as DropZoneContext),
    [value, hoveringComponent, areasWithZones, activeZones]
  );

  return (
    <>
      {memoValue && (
        <dropZoneContext.Provider value={memoValue}>
          {children}
        </dropZoneContext.Provider>
      )}
    </>
  );
};
