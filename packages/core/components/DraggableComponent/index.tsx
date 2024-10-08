import {
  ReactNode,
  Ref,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, Trash } from "lucide-react";
import { useModifierHeld } from "../../lib/use-modifier-held";
import { useAppContext } from "../Puck/context";
import { Loader } from "../Loader";
import { useSortable } from "@dnd-kit/react/sortable";
import { createPortal } from "react-dom";

import { dropZoneContext, DropZoneProvider } from "../DropZone";
import { createDynamicCollisionDetector } from "./collision/dynamic";
import { DragAxis } from "./collision/dynamic/get-direction";

const getClassName = getClassNameFactory("DraggableComponent", styles);

// Magic numbers are used to position actions overlay 8px from top of component, bottom of component (when sticky scrolling) and side of preview
const space = 8;
const actionsOverlayTop = space * 6.5;
const actionsTop = -(actionsOverlayTop - 8);
const actionsRight = space;

export const DraggableComponent = ({
  children,
  depth,
  componentType,
  id,
  index,
  zoneCompound,
  isLoading = false,
  isSelected = false,
  debug,
  label,
  isEnabled,
  dragAxis,
  inDroppableZone = true,
}: {
  children: (ref: Ref<any>) => ReactNode;
  componentType: string;
  depth: number;
  id: string;
  index: number;
  zoneCompound: string;
  isSelected?: boolean;
  debug?: string;
  label?: string;
  isLoading: boolean;
  isEnabled?: boolean;
  dragAxis: DragAxis;
  inDroppableZone: boolean;
}) => {
  const { zoomConfig, dispatch, iframe, state } = useAppContext();
  const isModifierHeld = useModifierHeld("Alt");
  const ctx = useContext(dropZoneContext);

  const overlayRef = useRef<HTMLDivElement>(null);

  const [localZones, setLocalZones] = useState<Record<string, boolean>>({});

  // TODO 26/08/24 this doesn't work when we have more than one level of zone
  // TODO for example, try dragging a card to next grid item in `/grid` demo
  // TODO and note it jumps to root
  // TODO to fix, it needs to propagate upstream
  const registerLocalZone = useCallback(
    (zoneCompound: string, active: boolean) => {
      // Propagate local zone
      ctx?.registerLocalZone?.(zoneCompound, active);

      setLocalZones((obj) => ({
        ...obj,
        [zoneCompound]: active,
      }));
    },
    [setLocalZones]
  );

  const containsActiveZone =
    Object.values(localZones).filter(Boolean).length > 0;

  const { path = [] } = ctx || {};

  const { ref: sortableRef, status } = useSortable({
    id,
    index,
    group: zoneCompound,
    data: {
      group: zoneCompound,
      index,
      componentType,
      containsActiveZone,
      depth,
      path,
    },
    collisionPriority: isEnabled ? depth : 0,
    collisionDetector: createDynamicCollisionDetector(dragAxis),
    disabled: !isEnabled,
    // handle: overlayRef,
  });

  const userIsDragging = !!ctx?.draggedItem;

  const thisIsDragging = status === "dragging";

  const ref = useRef<Element>();

  const refSetter = useCallback(
    (el: Element | null) => {
      sortableRef(el);

      if (el) {
        ref.current = el;
      }
    },
    [sortableRef]
  );

  const sync = useCallback(() => {
    if (!ref.current || !overlayRef.current) return;

    const rect = ref.current!.getBoundingClientRect();

    let iframeLeft = 0;
    let iframeTop = 0;

    if (iframe.enabled) {
      const frameEl = document.getElementById("preview-frame");

      if (!frameEl) {
        throw new Error("iframe enabled, but could not find element");
      }

      const frameRect = frameEl.getBoundingClientRect();

      iframeLeft = frameRect.left;
      iframeTop = frameRect.top;
    }

    const previewEl = document.getElementById("puck-preview");

    if (!previewEl) return;

    const previewRect = previewEl.getBoundingClientRect();

    overlayRef.current!.style.left = `${
      rect.left - previewRect.left + iframeLeft
    }px`;
    overlayRef.current!.style.top = `${
      rect.top - previewRect.top + iframeTop
    }px`;
    overlayRef.current!.style.height = `${rect.height}px`;
    overlayRef.current!.style.width = `${rect.width}px`;
  }, [ref, overlayRef]);

  useEffect(() => {
    ctx?.registerPath!({
      index,
      zone: zoneCompound,
    });
  }, []);

  const onClick = useCallback(
    (e: SyntheticEvent | Event) => {
      e.stopPropagation();
      dispatch({
        type: "setUi",
        ui: {
          itemSelector: { index, zone: zoneCompound },
        },
      });
    },
    [index, zoneCompound, id]
  );

  const onDuplicate = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      dispatch({
        type: "duplicate",
        sourceIndex: index,
        sourceZone: zoneCompound,
      });
    },
    [index, zoneCompound]
  );

  const onRemove = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation();
      dispatch({
        type: "remove",
        index: index,
        zone: zoneCompound,
      });
    },
    [index, zoneCompound]
  );

  const [hover, setHover] = useState(false);

  const indicativeHover = ctx?.hoveringComponent === id;

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const el = ref.current as HTMLElement;

    const _onMouseOver = (e: Event) => {
      if (userIsDragging) {
        // User is dragging, and dragging this item
        if (thisIsDragging) {
          setHover(true);
        } else {
          setHover(false);
        }
      } else {
        setHover(true);
      }

      e.stopPropagation();
    };

    const _onMouseOut = (e: Event) => {
      e.stopPropagation();

      setHover(false);
    };

    el.setAttribute("data-puck-component", "");
    el.style.position = "relative";
    el.addEventListener("click", onClick);
    el.addEventListener("mouseover", _onMouseOver);
    el.addEventListener("mouseout", _onMouseOut);

    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("mouseover", _onMouseOver);
      el.removeEventListener("mouseout", _onMouseOut);
    };
  }, [
    ref,
    overlayRef,
    onClick,
    containsActiveZone,
    zoneCompound,
    id,
    userIsDragging,
    thisIsDragging,
    inDroppableZone,
  ]);

  useEffect(sync, [ref]);
  useEffect(sync, [state.data]);

  const isVisible = isSelected || hover || indicativeHover || userIsDragging;

  useEffect(() => {
    if (!ref.current || !overlayRef.current) {
      return;
    }

    const el = ref.current as HTMLElement;

    const canvasRoot = document.getElementById("puck-canvas-root");

    const onCanvasScroll = () => {
      if (!ref.current || !overlayRef.current) return;

      sync();
    };

    const scrollTarget = iframe.enabled
      ? (document.getElementById("preview-frame") as HTMLIFrameElement)
          .contentWindow
      : canvasRoot;

    if (isVisible) {
      scrollTarget?.addEventListener("scroll", onCanvasScroll);
    } else {
      scrollTarget?.removeEventListener("scroll", onCanvasScroll);
    }

    const observer = new ResizeObserver(() => {
      sync();
    });

    observer.observe(el);

    let isObserving = true;

    const loop = () => {
      requestAnimationFrame(() => {
        if (isObserving && isVisible && userIsDragging) {
          sync();
          loop();
        }
      });
    };

    if (isVisible && userIsDragging) {
      loop();
    }

    return () => {
      if (!ref.current) return;

      isObserving = false;
      observer.disconnect();
      scrollTarget?.removeEventListener("scroll", onCanvasScroll);
    };
  }, [ref, overlayRef, isVisible, userIsDragging, hover, iframe]);

  return (
    <DropZoneProvider
      value={{
        ...ctx!,
        areaId: id,
        zoneCompound,
        index,
        depth: depth + 1,
        registerLocalZone,
        path: [...path, id],
      }}
    >
      {/* <p>isEnabled: {JSON.stringify(isEnabled)}</p> */}
      {/* <p>collisionPriority: {JSON.stringify(collisionPriority)}</p> */}
      {/* <p>localZones: {JSON.stringify(localZones)}</p> */}
      {/* <p>containsActiveZone: {JSON.stringify(containsActiveZone)}</p> */}
      {/* <p>is parent droppable(): {JSON.stringify(isDroppableTarget())}</p> */}
      {isVisible &&
        createPortal(
          <div
            className={getClassName({
              isDragging: thisIsDragging,
              isSelected,
              isModifierHeld,
              hover: hover || indicativeHover,
            })}
            ref={overlayRef}
          >
            {debug}
            {isLoading && (
              <div className={getClassName("loadingOverlay")}>
                <Loader />
              </div>
            )}
            <div
              className={getClassName("actionsOverlay")}
              style={{
                top: actionsOverlayTop / zoomConfig.zoom,
              }}
            >
              <div
                className={getClassName("actions")}
                style={{
                  transform: `scale(${1 / zoomConfig.zoom}`,
                  top: actionsTop / zoomConfig.zoom,
                  right: actionsRight / zoomConfig.zoom,
                }}
              >
                {label && (
                  <div className={getClassName("actionsLabel")}>{label}</div>
                )}
                <button
                  className={getClassName("action")}
                  onClick={onDuplicate}
                >
                  <Copy size={16} />
                </button>
                <button className={getClassName("action")} onClick={onRemove}>
                  <Trash size={16} />
                </button>
              </div>
            </div>
            <div className={getClassName("overlay")} />
          </div>,
          document.getElementById("puck-preview") || document.body
        )}
      {children(refSetter)}
    </DropZoneProvider>
  );
};
