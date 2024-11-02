import {
  ReactNode,
  Ref,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, Trash } from "lucide-react";
import { useModifierHeld } from "../../lib/use-modifier-held";
import { useAppContext } from "../Puck/context";
import { Loader } from "../Loader";
import { ActionBar } from "../ActionBar";

import { useSortable } from "@dnd-kit/react/sortable";
import { createPortal } from "react-dom";

import { dropZoneContext, DropZoneProvider } from "../DropZone";
import { createDynamicCollisionDetector } from "./collision/dynamic";
import { DragAxis } from "./collision/dynamic/get-direction";
import { DefaultComponentProps } from "../../types";
import { getItem } from "../../lib/get-item";

const getClassName = getClassNameFactory("DraggableComponent", styles);

// Magic numbers are used to position actions overlay 8px from top of component, bottom of component (when sticky scrolling) and side of preview
const space = 8;
const actionsOverlayTop = space * 6.5;
const actionsTop = -(actionsOverlayTop - 8);
const actionsRight = space;

const DefaultActionBar = ({
  label,
  children,
}: {
  label: string | undefined;
  children: ReactNode;
}) => (
  <ActionBar label={label}>
    <ActionBar.Group>{children}</ActionBar.Group>
  </ActionBar>
);

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
  const {
    zoomConfig,
    overrides,
    selectedItem,
    getPermissions,
    dispatch,
    iframe,
    state,
  } = useAppContext();

  const isModifierHeld = useModifierHeld("Alt");
  const ctx = useContext(dropZoneContext);

  const overlayRef = useRef<HTMLDivElement>(null);

  const [localZones, setLocalZones] = useState<Record<string, boolean>>({});

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

  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    const item = getItem({ index, zone: zoneCompound }, state.data);

    if (item) {
      const perms = getPermissions({
        item,
      });

      setCanDrag(perms.drag ?? true);
    }
  }, [state, index, zoneCompound, getPermissions]);

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
      inDroppableZone,
    },
    collisionPriority: isEnabled ? depth : 0,
    collisionDetector: createDynamicCollisionDetector(dragAxis),
    disabled: !isEnabled || !canDrag, // TODO check this can still be dropped against

    // "Out of the way" transition from react-beautiful-dnd
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    },
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
  }, [isSelected]);

  const CustomActionBar = useMemo(
    () => overrides.actionBar || DefaultActionBar,
    [overrides.actionBar]
  );

  const permissions = getPermissions({
    item: selectedItem,
  });

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

  const onDelete = useCallback(
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

    el.setAttribute("data-puck-component", id);
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

  const isVisible = isSelected || hover || indicativeHover;

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
                <CustomActionBar label={label}>
                  {permissions.duplicate && (
                    <ActionBar.Action onClick={onDuplicate} label="Duplicate">
                      <Copy size={16} />
                    </ActionBar.Action>
                  )}
                  {permissions.delete && (
                    <ActionBar.Action onClick={onDelete} label="Delete">
                      <Trash size={16} />
                    </ActionBar.Action>
                  )}
                </CustomActionBar>
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
