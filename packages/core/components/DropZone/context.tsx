import {
  CSSProperties,
  ReactNode,
  createContext,
  useCallback,
  useState,
} from "react";
import { Config, Data } from "../../types/Config";
import { DragStart, DragUpdate } from "@measured/dnd";
import { ItemSelector, getItem } from "../../lib/get-item";
import { PuckAction } from "../../reducer";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { useDebounce } from "use-debounce";
import { getZoneId } from "../../lib/get-zone-id";

export type PathData = Record<string, { path: string[]; label: string }>;

export type DropZoneContext<
  UserConfig extends Config<any, any, any> = Config<any, any, any>
> = {
  data: Data;
  config: UserConfig;
  componentState?: Record<string, any>;
  itemSelector?: ItemSelector | null;
  setItemSelector?: (newIndex: ItemSelector | null) => void;
  dispatch?: (action: PuckAction) => void;
  areaId?: string;
  draggedItem?: DragStart & Partial<DragUpdate>;
  placeholderStyle?: CSSProperties;
  hoveringArea?: string | null;
  setHoveringArea?: (area: string | null) => void;
  hoveringZone?: string | null;
  setHoveringZone?: (zone: string | null) => void;
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
  disableZoom?: boolean;
} | null;

export const dropZoneContext = createContext<DropZoneContext>(null);

export const DropZoneProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: DropZoneContext;
}) => {
  const [hoveringArea, setHoveringArea] = useState<string | null>(null);
  const [hoveringZone, setHoveringZone] = useState<string | null>(
    rootDroppableId
  );

  // Hovering component may match area, but areas must always contain zones
  const [hoveringComponent, setHoveringComponent] = useState<string | null>();

  const [hoveringAreaDb] = useDebounce(hoveringArea, 75, { leading: false });

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

  const [pathData, setPathData] = useState<PathData>();

  const registerPath = useCallback(
    (selector: ItemSelector) => {
      if (!value?.data) {
        return;
      }

      const item = getItem(selector, value.data);

      if (!item) {
        return;
      }

      const [area] = getZoneId(selector.zone);

      setPathData((latestPathData = {}) => {
        const parentPathData = latestPathData[area] || { path: [] };

        return {
          ...latestPathData,
          [item.props.id]: {
            path: [
              ...parentPathData.path,
              ...(selector.zone ? [selector.zone] : []),
            ],
            label: item.type as string,
          },
        };
      });
    },
    [value, setPathData]
  );

  return (
    <>
      {value && (
        <dropZoneContext.Provider
          value={{
            hoveringArea: value.draggedItem ? hoveringAreaDb : hoveringArea,
            setHoveringArea,
            hoveringZone,
            setHoveringZone,
            hoveringComponent,
            setHoveringComponent,
            registerZoneArea,
            areasWithZones,
            registerZone,
            unregisterZone,
            activeZones,
            registerPath,
            pathData,
            ...value,
          }}
        >
          {children}
        </dropZoneContext.Provider>
      )}
    </>
  );
};
