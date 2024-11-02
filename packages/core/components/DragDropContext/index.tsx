import { DragDropProvider } from "@dnd-kit/react";
import { useAppContext } from "../Puck/context";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DragDropManager, Feedback } from "@dnd-kit/dom";
import { DragDropEvents } from "@dnd-kit/abstract";
import { DropZoneProvider } from "../DropZone";
import type { Draggable, Droppable } from "@dnd-kit/dom";
import { getItem, ItemSelector } from "../../lib/get-item";
import { PathData } from "../DropZone/context";
import { getZoneId } from "../../lib/get-zone-id";
import { Direction } from "../DraggableComponent/collision/dynamic";
import { createNestedDroppablePlugin } from "./NestedDroppablePlugin";
import { insertComponent } from "../../lib/insert-component";

type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;
type DragCbs = Partial<{ [eventName in keyof Events]: Events[eventName][] }>;

const dragListenerContext = createContext<{
  dragListeners: DragCbs;
  setDragListeners?: Dispatch<SetStateAction<DragCbs>>;
}>({
  dragListeners: {},
});

type EventKeys = keyof Events;

export function useDragListener(
  type: EventKeys,
  fn: Events[EventKeys],
  deps: any[] = []
) {
  const { setDragListeners } = useContext(dragListenerContext);

  useEffect(() => {
    if (setDragListeners) {
      setDragListeners((old) => ({
        ...old,
        [type]: [...(old[type] || []), fn],
      }));
    }
  }, deps);
}

type Preview = {
  componentType: string;
  index: number;
  zone: string;
  props: Record<string, any>;
  type: "insert" | "move";
} | null;

export const previewContext = createContext<Preview>(null);

export const DragDropContext = ({ children }: { children: ReactNode }) => {
  const { state, config, dispatch, resolveData } = useAppContext();

  const [preview, setPreview] = useState<Preview>(null);

  const { data } = state;
  const [deepest, setDeepest] = useState<{
    zone: string | null;
    area: string | null;
  } | null>(null);

  const [manager] = useState(
    new DragDropManager({
      plugins: [
        Feedback,
        createNestedDroppablePlugin({
          onChange: ({ deepestZoneId, deepestAreaId }) => {
            setDeepest({ zone: deepestZoneId, area: deepestAreaId });
          },
        }),
      ],
    })
  );

  const [draggedItem, setDraggedItem] = useState<Draggable | null>();

  const [dragListeners, setDragListeners] = useState<DragCbs>({});

  const [pathData, setPathData] = useState<PathData>();

  const dragMode = useRef<"new" | "existing" | null>(null);

  const registerPath = useCallback(
    (selector: ItemSelector) => {
      const item = getItem(selector, data);

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
    [data, setPathData]
  );

  const initialSelector = useRef<{ zone: string; index: number }>();

  return (
    <dragListenerContext.Provider
      value={{
        dragListeners,
        setDragListeners,
      }}
    >
      <previewContext.Provider value={preview}>
        <DragDropProvider
          manager={manager}
          onDragEnd={(event) => {
            const { source, target } = event.operation;

            setDraggedItem(null);

            if (!source) return;

            let zone = source.data.group;
            let index = source.data.index;

            // TODO replace with actual callback when exists
            setTimeout(() => {
              if (preview) {
                setPreview(null);

                if (preview.type === "insert") {
                  insertComponent(
                    preview.componentType,
                    preview.zone,
                    preview.index,
                    { config, dispatch, resolveData, state }
                  );
                } else if (initialSelector.current) {
                  dispatch({
                    type: "move",
                    sourceIndex: initialSelector.current.index,
                    sourceZone: initialSelector.current.zone,
                    destinationIndex: preview.index,
                    destinationZone: preview.zone,
                    recordHistory: false,
                  });
                }
              }

              dispatch({
                type: "setUi",
                ui: {
                  itemSelector: { index, zone },
                  isDragging: false,
                },
                recordHistory: true,
              });

              dragListeners.dragend?.forEach((fn) => {
                fn(event, manager);
              });
            }, 250);
          }}
          onDragOver={(event, manager) => {
            // Prevent the optimistic re-ordering
            event.preventDefault();

            // Drag end can sometimes trigger after drag
            if (!draggedItem) return;

            const { source, target } = event.operation;

            if (!target || !source) return;

            const sourceData = source.data;
            const targetData = target.data;

            const isOverZone = targetData.zone;

            let sourceZone = sourceData.group;
            let sourceIndex = sourceData.index;
            let targetZone = targetData.group;
            let targetIndex = targetData.index;

            const [sourceId] = (source.id as string).split(":");
            const [targetId] = (target.id as string).split(":");

            const direction = manager.dragOperation.data?.direction as
              | Direction
              | undefined;

            const collisionPosition =
              direction === "up" || direction === "left" ? "before" : "after";

            if (targetIndex >= sourceIndex && sourceZone === targetZone) {
              targetIndex = targetIndex - 1;
            }

            if (collisionPosition === "after") {
              targetIndex = targetIndex + 1;
            }

            if (isOverZone) {
              targetZone = target.id.toString();
              targetIndex = 0; // TODO place at end
            }

            // Abort if dragging over self or descendant
            if (
              targetId === sourceId ||
              pathData?.[target.id]?.path.find((path) => {
                const [pathId] = (path as string).split(":");
                return pathId === sourceId;
              })
            ) {
              return;
            }

            if (dragMode.current === "new") {
              setPreview({
                componentType: sourceData.componentType,
                type: "insert",
                index: targetIndex,
                zone: targetZone,
                props: {
                  id: source.id.toString(),
                },
              });
            } else {
              if (!initialSelector.current) {
                initialSelector.current = {
                  zone: sourceData.group,
                  index: sourceData.index,
                };
              }

              const item = getItem(initialSelector.current, data);

              if (item) {
                setPreview({
                  componentType: sourceData.componentType,
                  type: "move",
                  index: targetIndex,
                  zone: targetZone,
                  props: item.props,
                });
              }
            }

            dragListeners.dragover?.forEach((fn) => {
              fn(event, manager);
            });
          }}
          onDragStart={(event) => {
            dispatch({
              type: "setUi",
              ui: { itemSelector: null, isDragging: true },
            });

            dragListeners.dragstart?.forEach((fn) => {
              fn(event, manager);
            });
          }}
          onBeforeDragStart={(event) => {
            if (draggedItem) {
              console.warn("New drag started before previous drag cleaned up");
            }

            const isNewComponent =
              event.operation.source?.data.type === "drawer";

            dragMode.current = isNewComponent ? "new" : "existing";
            initialSelector.current = undefined;

            setDraggedItem(event.operation.source);
          }}
        >
          <DropZoneProvider
            value={{
              data,
              config,
              dispatch,
              draggedItem,
              mode: "edit",
              areaId: "root",
              depth: 0,
              registerPath,
              pathData,
              deepestZone: deepest?.zone,
              deepestArea: deepest?.area,
              path: [],
            }}
          >
            {children}
          </DropZoneProvider>
        </DragDropProvider>
      </previewContext.Provider>
    </dragListenerContext.Provider>
  );
};
