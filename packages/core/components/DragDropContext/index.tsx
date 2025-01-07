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
  useId,
  useRef,
  useState,
} from "react";
import { AutoScroller, defaultPreset, DragDropManager } from "@dnd-kit/dom";
import { DragDropEvents } from "@dnd-kit/abstract";
import { DropZoneProvider } from "../DropZone";
import type { Draggable, Droppable } from "@dnd-kit/dom";
import { getItem, ItemSelector } from "../../lib/get-item";
import { PathData, Preview, useZoneStore } from "../DropZone/context";
import { getZoneId } from "../../lib/get-zone-id";
import { createNestedDroppablePlugin } from "./NestedDroppablePlugin";
import { insertComponent } from "../../lib/insert-component";
import { useDebouncedCallback } from "use-debounce";
import { CollisionMap } from "../DraggableComponent/collision/dynamic";
import { ComponentDndData } from "../DraggableComponent";
import { isElement } from "@dnd-kit/dom/utilities";

import { PointerSensor } from "./PointerSensor";
import { collisionStore } from "../DraggableComponent/collision/dynamic/store";
import { generateId } from "../../lib/generate-id";

const DEBUG = false;

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

type DeepestParams = {
  zone: string | null;
  area: string | null;
};

const AREA_CHANGE_DEBOUNCE_MS = 100;

type DragDropContextProps = {
  children: ReactNode;
  disableAutoScroll?: boolean;
};

/**
 * Temporarily disable fallback collisions types, which
 * can cause issues during a zone switch.
 *
 * @param timeout the time in ms to disable the fallback collision for
 * @returns a function that temporarily disables the collision
 */
const useTempDisableFallback = (timeout: number) => {
  const lastFallbackDisable = useRef<string>(null);

  return useCallback((manager: DragDropManager) => {
    collisionStore.setState({ fallbackEnabled: false });

    // Track an ID in case called more than once, so only last call re-enables
    const fallbackId = generateId();
    lastFallbackDisable.current = fallbackId;

    setTimeout(() => {
      if (lastFallbackDisable.current === fallbackId) {
        collisionStore.setState({ fallbackEnabled: true });
        manager.collisionObserver.forceUpdate(true);
      }
    }, timeout);
  }, []);
};

const getChanged = (params: DeepestParams) => {
  const { zoneDepthIndex, areaDepthIndex } = useZoneStore.getState();

  const stateHasZone = Object.keys(zoneDepthIndex).length > 0;
  const stateHasArea = Object.keys(areaDepthIndex).length > 0;

  if (params.zone) {
  }

  let zoneChanged = false;
  let areaChanged = false;

  if (params.zone && !zoneDepthIndex[params.zone]) {
    zoneChanged = true;
  } else if (!params.zone && stateHasZone) {
    zoneChanged = true;
  } else if (params.area && !areaDepthIndex[params.area]) {
    areaChanged = true;
  } else if (!params.area && stateHasArea) {
    areaChanged = true;
  }

  return { zoneChanged, areaChanged };
};

const DragDropContextClient = ({
  children,
  disableAutoScroll,
}: DragDropContextProps) => {
  const { state, config, dispatch, resolveData } = useAppContext();

  const { data } = state;

  const debouncedParamsRef = useRef<DeepestParams | null>(null);

  const tempDisableFallback = useTempDisableFallback(100);

  const setDeepestAndCollide = useCallback(
    (params: DeepestParams, manager: DragDropManager) => {
      const { zoneChanged, areaChanged } = getChanged(params);

      if (!zoneChanged && !areaChanged) return;

      useZoneStore.setState({
        zoneDepthIndex: params.zone ? { [params.zone]: true } : {},
        areaDepthIndex: params.area ? { [params.area]: true } : {},
      });

      // Disable fallback collisions temporarily after zone change,
      // as these can cause unexpected collisions
      tempDisableFallback(manager);

      setTimeout(() => {
        // Force update after debounce
        manager.collisionObserver.forceUpdate(true);
      }, 50);

      debouncedParamsRef.current = null;
    },
    []
  );

  const setDeepestDb = useDebouncedCallback(
    setDeepestAndCollide,
    AREA_CHANGE_DEBOUNCE_MS
  );

  const cancelDb = () => {
    setDeepestDb.cancel();
    debouncedParamsRef.current = null;
  };

  useEffect(() => {
    if (DEBUG) {
      useZoneStore.subscribe((s) =>
        console.log(
          s.previewIndex,
          Object.entries(s.zoneDepthIndex)[0]?.[0],
          Object.entries(s.areaDepthIndex)[0]?.[0]
        )
      );
    }
  }, []);

  const id = useId();

  const [plugins] = useState(() => [
    ...(disableAutoScroll
      ? defaultPreset.plugins.filter((plugin) => plugin !== AutoScroller)
      : defaultPreset.plugins),
    createNestedDroppablePlugin(
      {
        onChange: (params, manager) => {
          const state = useZoneStore.getState();

          const { zoneChanged, areaChanged } = getChanged(params);

          const isDragging = manager.dragOperation.status.dragging;

          if (areaChanged || zoneChanged) {
            let nextZoneDepthIndex: Record<string, boolean> = {};
            let nextAreaDepthIndex: Record<string, boolean> = {};

            if (params.zone) {
              nextZoneDepthIndex = { [params.zone]: true };
            }

            if (params.area) {
              nextAreaDepthIndex = { [params.area]: true };
            }

            useZoneStore.setState({ nextZoneDepthIndex, nextAreaDepthIndex });
          }

          if (params.zone !== "void" && state.zoneDepthIndex["void"]) {
            setDeepestAndCollide(params, manager);
            return;
          }

          if (areaChanged) {
            if (isDragging) {
              // Only call the debounced function if these params differ from the last pending call
              const debouncedParams = debouncedParamsRef.current;
              const isSameParams =
                debouncedParams &&
                debouncedParams.area === params.area &&
                debouncedParams.zone === params.zone;

              if (!isSameParams) {
                cancelDb(); // NB we always cancel the debounce if the params change, so we could just use a timer
                setDeepestDb(params, manager);
                debouncedParamsRef.current = params;
              }
            } else {
              cancelDb();
              setDeepestAndCollide(params, manager);
            }

            return;
          }

          if (zoneChanged) {
            setDeepestAndCollide(params, manager);
          }

          cancelDb();
        },
      },
      id
    ),
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

  const initialSelector = useRef<{ zone: string; index: number }>(undefined);

  return (
    <div id={id}>
      <dragListenerContext.Provider
        value={{
          dragListeners,
          setDragListeners,
        }}
      >
        <DragDropProvider
          plugins={plugins}
          sensors={sensors}
          onDragEnd={(event, manager) => {
            const { source, target } = event.operation;

            if (!source) {
              useZoneStore.setState({ draggedItem: null });

              return;
            }

            const { zone, index } = source.data as ComponentDndData;

            const { previewIndex } = useZoneStore.getState();

            const thisPreview: Preview | null =
              previewIndex[zone]?.props.id === source.id
                ? previewIndex[zone]
                : null;

            // Delay insert until animation has finished
            setTimeout(() => {
              useZoneStore.setState({ draggedItem: null });

              // Tidy up cancellation
              if (event.canceled || target?.type === "void") {
                useZoneStore.setState({ previewIndex: {} });

                dragListeners.dragend?.forEach((fn) => {
                  fn(event, manager);
                });

                return;
              }

              // Finalise the drag
              if (thisPreview) {
                useZoneStore.setState({ previewIndex: {} });

                if (thisPreview.type === "insert") {
                  insertComponent(
                    thisPreview.componentType,
                    thisPreview.zone,
                    thisPreview.index,
                    { config, dispatch, resolveData, state }
                  );
                } else if (initialSelector.current) {
                  dispatch({
                    type: "move",
                    sourceIndex: initialSelector.current.index,
                    sourceZone: initialSelector.current.zone,
                    destinationIndex: thisPreview.index,
                    destinationZone: thisPreview.zone,
                    recordHistory: false,
                  });
                }
              }

              // Delay selection until next cycle to give box chance to render
              setTimeout(() => {
                dispatch({
                  type: "setUi",
                  ui: {
                    itemSelector: { index, zone },
                    isDragging: false,
                  },
                  recordHistory: true,
                });
              }, 50);

              dragListeners.dragend?.forEach((fn) => {
                fn(event, manager);
              });
            }, 250);
          }}
          onDragOver={(event, manager) => {
            // Prevent the optimistic re-ordering
            event.preventDefault();

            const draggedItem = useZoneStore.getState().draggedItem;

            // Drag end can sometimes trigger after drag
            if (!draggedItem) return;

            // Cancel any stale debounces
            cancelDb();

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
              useZoneStore.setState({
                previewIndex: {
                  [targetZone]: {
                    componentType: sourceData.componentType,
                    type: "insert",
                    index: targetIndex,
                    zone: targetZone,
                    props: {
                      id: source.id.toString(),
                    },
                  },
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
                useZoneStore.setState({
                  previewIndex: {
                    [targetZone]: {
                      componentType: sourceData.componentType,
                      type: "move",
                      index: targetIndex,
                      zone: targetZone,
                      props: item.props,
                    },
                  },
                });
              }
            }

            dragListeners.dragover?.forEach((fn) => {
              fn(event, manager);
            });
          }}
          onDragStart={(event, manager) => {
            dispatch({
              type: "setUi",
              ui: { itemSelector: null, isDragging: true },
            });

            dragListeners.dragstart?.forEach((fn) => {
              fn(event, manager);
            });
          }}
          onBeforeDragStart={(event) => {
            const isNewComponent =
              event.operation.source?.data.type === "drawer";

            dragMode.current = isNewComponent ? "new" : "existing";
            initialSelector.current = undefined;

            useZoneStore.setState({ draggedItem: event.operation.source });
          }}
        >
          <DropZoneProvider
            value={{
              data,
              config,
              mode: "edit",
              areaId: "root",
              depth: 0,
              registerPath,
              pathData,
              path: [],
            }}
          >
            {children}
          </DropZoneProvider>
        </DragDropProvider>
      </dragListenerContext.Provider>
    </div>
  );
};

export const DragDropContext = ({
  children,
  disableAutoScroll,
}: DragDropContextProps) => {
  const { status } = useAppContext();

  if (status === "LOADING") {
    return children;
  }

  return (
    <DragDropContextClient disableAutoScroll={disableAutoScroll}>
      {children}
    </DragDropContextClient>
  );
};
