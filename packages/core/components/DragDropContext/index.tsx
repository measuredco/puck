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
import { defaultPreset, DragDropManager, PointerSensor } from "@dnd-kit/dom";
import { DragDropEvents } from "@dnd-kit/abstract";
import { DropZoneProvider } from "../DropZone";
import type { Draggable, Droppable } from "@dnd-kit/dom";
import { getItem, ItemSelector } from "../../lib/get-item";
import { PathData } from "../DropZone/context";
import { getZoneId } from "../../lib/get-zone-id";
import {
  createNestedDroppablePlugin,
  findDeepestCandidate,
} from "./NestedDroppablePlugin";
import { insertComponent } from "../../lib/insert-component";
import { useDebouncedCallback } from "use-debounce";
import { CollisionMap } from "../DraggableComponent/collision/dynamic";
import { ComponentDndData } from "../DraggableComponent";
import { isElement } from "@dnd-kit/dom/utilities";

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

type DeepestParams = {
  zone: string | null;
  area: string | null;
};

const AREA_CHANGE_DEBOUNCE_MS = 100;

const DragDropContextClient = ({ children }: { children: ReactNode }) => {
  const { state, config, dispatch, resolveData } = useAppContext();

  const [preview, setPreview] = useState<Preview>(null);

  const { data } = state;
  const [deepest, setDeepest] = useState<DeepestParams | null>(null);
  const [nextDeepest, setNextDeepest] = useState<DeepestParams | null>(null);

  const deepestRef = useRef(deepest);
  const dbDeepestRef = useRef(deepest);

  const setDeepestDb = useDebouncedCallback((params: DeepestParams) => {
    setDeepest(params);

    dbDeepestRef.current = params;
  }, AREA_CHANGE_DEBOUNCE_MS);

  const setDeepestDbMaybe = useCallback(
    (params: DeepestParams) => {
      if (
        deepestRef.current === null ||
        deepestRef.current?.zone === "void" ||
        (params.zone &&
          params.area &&
          dbDeepestRef.current?.area === params.area)
      ) {
        setDeepest(params);
      } else {
        setDeepestDb(params);
      }

      if (!dbDeepestRef.current) {
        dbDeepestRef.current = params;
      }
    },
    [deepest]
  );

  const [plugins] = useState(() => [
    ...defaultPreset.plugins,
    createNestedDroppablePlugin({
      onChange: (params, manager) => {
        const paramsChanged =
          !deepestRef.current ||
          params.area !== deepestRef.current?.area ||
          params.zone !== deepestRef.current?.zone;

        if (paramsChanged) {
          if (manager.dragOperation.status.dragging) {
            setDeepestDbMaybe(params);
          } else {
            setDeepest(params);
          }

          setNextDeepest(params);
        }

        if (params.area !== deepestRef.current?.area) {
          // Force a collision on area change
          setTimeout(() => {
            manager.collisionObserver.forceUpdate(true);
          }, 50);
        }

        deepestRef.current = params;
      },
    }),
  ]);

  const [sensors] = useState(() => [
    PointerSensor.configure({
      activationConstraints(event, source) {
        const { pointerType, target } = event;

        if (
          pointerType === "mouse" &&
          isElement(target) &&
          (source.handle === target || source.handle?.contains(target))
        ) {
          return undefined;
        }

        const delay = { value: 200, tolerance: 10 };

        if (pointerType === "touch") {
          return { delay };
        }

        return {
          delay,
          distance: { value: 5 },
        };
      },
    }),
  ]);

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
          plugins={plugins}
          sensors={sensors}
          onDragEnd={(event, manager) => {
            const { source, target } = event.operation;

            if (!source) {
              setDraggedItem(null);

              return;
            }

            const { zone, index } = source.data as ComponentDndData;

            // Delay insert until animation has finished
            setTimeout(() => {
              setDraggedItem(null);

              // Tidy up cancellation
              if (event.canceled || target?.type === "void") {
                if (preview) {
                  setPreview(null);
                }

                dragListeners.dragend?.forEach((fn) => {
                  fn(event, manager);
                });

                return;
              }

              // Finalise the drag
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

            if (!target || !source || target.type === "void") return;

            const [sourceId] = (source.id as string).split(":");
            const [targetId] = (target.id as string).split(":");

            const sourceData = source.data as ComponentDndData;

            let sourceZone = sourceData.zone;
            let sourceIndex = sourceData.index;

            let targetZone = "";
            let targetIndex = 0;

            if (target.type === "component") {
              const targetData = target.data as ComponentDndData;

              targetZone = targetData.zone;
              targetIndex = targetData.index;

              const collisionData = (
                manager.dragOperation.data?.collisionMap as CollisionMap
              )?.[targetId];

              const collisionPosition =
                collisionData?.direction === "up" ||
                collisionData?.direction === "left"
                  ? "before"
                  : "after";

              if (targetIndex >= sourceIndex && sourceZone === targetZone) {
                targetIndex = targetIndex - 1;
              }

              if (collisionPosition === "after") {
                targetIndex = targetIndex + 1;
              }
            } else {
              targetZone = target.id.toString();
              targetIndex = 0;
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
                  zone: sourceData.zone,
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
          onDragStart={(event, manager) => {
            setDeepest(
              findDeepestCandidate(event.operation.position.current, manager)
            );

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
              nextDeepestZone: nextDeepest?.zone,
              nextDeepestArea: nextDeepest?.area,
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

export const DragDropContext = ({ children }: { children: ReactNode }) => {
  const { status } = useAppContext();

  if (status === "LOADING") {
    return children;
  }

  return <DragDropContextClient>{children}</DragDropContextClient>;
};
