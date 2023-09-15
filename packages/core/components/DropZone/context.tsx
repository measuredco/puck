import {
  CSSProperties,
  ReactNode,
  createContext,
  useCallback,
  useState,
} from "react";
import { Config, Data } from "../../types/Config";
import { DragStart, DragUpdate } from "react-beautiful-dnd";
import { ItemSelector, getItem } from "../../lib/get-item";
import { PuckAction } from "../../lib/reducer";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { useDebounce } from "use-debounce";
import { getDropzoneId } from "../../lib/get-dropzone-id";

type PathData = Record<
  string,
  { selector: ItemSelector | null; label: string }[]
>;

type ContextProps = {
  data: Data;
  config: Config;
  itemSelector?: ItemSelector | null;
  setItemSelector?: (newIndex: ItemSelector | null) => void;
  dispatch?: (action: PuckAction) => void;
  areaId?: string;
  draggedItem?: DragStart & Partial<DragUpdate>;
  placeholderStyle?: CSSProperties;
  hoveringArea?: string | null;
  setHoveringArea?: (area: string | null) => void;
  hoveringDropzone?: string | null;
  setHoveringDropzone?: (dropzone: string | null) => void;
  hoveringComponent?: string | null;
  setHoveringComponent?: (id: string | null) => void;
  registerDropzoneArea?: (areaId: string) => void;
  areasWithDropzones?: Record<string, boolean>;
  registerDropzone?: (dropzoneCompound: string) => void;
  unregisterDropzone?: (dropzoneCompound: string) => void;
  activeDropzones?: Record<string, boolean>;
  pathData?: PathData;
  registerPath?: (selector: ItemSelector) => void;
  mode?: "edit" | "render";
} | null;

export const dropZoneContext = createContext<ContextProps>(null);

export const DropZoneProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: ContextProps;
}) => {
  const [hoveringArea, setHoveringArea] = useState<string | null>(null);
  const [hoveringDropzone, setHoveringDropzone] = useState<string | null>(
    rootDroppableId
  );

  // Hovering component may match area, but areas must always contain dropzones
  const [hoveringComponent, setHoveringComponent] = useState<string | null>();

  const [hoveringAreaDb] = useDebounce(hoveringArea, 75, { leading: false });

  const [areasWithDropzones, setAreasWithDropzones] = useState<
    Record<string, boolean>
  >({});

  const [activeDropzones, setActiveDropzones] = useState<
    Record<string, boolean>
  >({});

  const { dispatch = null } = value ? value : {};

  const registerDropzoneArea = useCallback(
    (area: string) => {
      setAreasWithDropzones((latest) => ({ ...latest, [area]: true }));
    },
    [setAreasWithDropzones]
  );

  const registerDropzone = useCallback(
    (dropzoneCompound: string) => {
      if (!dispatch) {
        return;
      }

      dispatch({
        type: "registerDropZone",
        dropzone: dropzoneCompound,
      });

      setActiveDropzones((latest) => ({ ...latest, [dropzoneCompound]: true }));
    },
    [setActiveDropzones, dispatch]
  );

  const unregisterDropzone = useCallback(
    (dropzoneCompound: string) => {
      if (!dispatch) {
        return;
      }

      dispatch({
        type: "unregisterDropZone",
        dropzone: dropzoneCompound,
      });

      setActiveDropzones((latest) => ({
        ...latest,
        [dropzoneCompound]: false,
      }));
    },
    [setActiveDropzones, dispatch]
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

      const [area] = getDropzoneId(selector.dropzone);

      setPathData((latestPathData = {}) => {
        const pathData = latestPathData[area] || [];

        return {
          ...latestPathData,
          [item.props.id]: [
            ...pathData,
            {
              selector,
              label: item.type as string,
            },
          ],
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
            hoveringDropzone,
            setHoveringDropzone,
            hoveringComponent,
            setHoveringComponent,
            registerDropzoneArea,
            areasWithDropzones,
            registerDropzone,
            unregisterDropzone,
            activeDropzones,
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
