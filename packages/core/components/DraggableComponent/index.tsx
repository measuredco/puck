import {
  CSSProperties,
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

import { createPortal } from "react-dom";

import { dropZoneContext, DropZoneProvider } from "../DropZone";
import { createDynamicCollisionDetector } from "./collision/dynamic";
import { getItem } from "../../lib/get-item";
import { DragAxis } from "../../types";
import { UniqueIdentifier } from "@dnd-kit/abstract";
import { useSortableSafe } from "../../lib/dnd-kit/safe";

const getClassName = getClassNameFactory("DraggableComponent", styles);

const DEBUG = false;

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

export type ComponentDndData = {
  zone: string;
  index: number;
  componentType: string;
  containsActiveZone: boolean;
  depth: number;
  path: UniqueIdentifier[];
  inDroppableZone: boolean;
};

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
  autoDragAxis,
  userDragAxis,
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
  autoDragAxis: DragAxis;
  userDragAxis?: DragAxis;
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

  const userIsDragging = !!ctx?.draggedItem;

  const canCollide = canDrag || userIsDragging;

  const disabled = !isEnabled || !canCollide;

  const [dragAxis, setDragAxis] = useState(userDragAxis || autoDragAxis);

  const { ref: sortableRef, status } = useSortableSafe<ComponentDndData>({
    id,
    index,
    group: zoneCompound,
    type: "component",
    data: {
      zone: zoneCompound,
      index,
      componentType,
      containsActiveZone,
      depth,
      path,
      inDroppableZone,
    },
    collisionPriority: isEnabled ? depth : 0,
    collisionDetector: createDynamicCollisionDetector(dragAxis),
    disabled,

    // "Out of the way" transition from react-beautiful-dnd
    transition: {
      duration: 200,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    },
  });

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

  const [portalEl, setPortalEl] = useState<HTMLElement>();

  useEffect(() => {
    setPortalEl(
      (iframe.enabled
        ? ref.current?.ownerDocument.body
        : document.getElementById("puck-preview")) ?? document.body
    );
  }, [iframe.enabled]);

  const getStyle = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current!.getBoundingClientRect();

    const doc = ref.current.ownerDocument;
    const view = doc.defaultView;
    const portalContainerEl = iframe.enabled
      ? null
      : document.getElementById("puck-preview");

    const portalContainerRect = portalContainerEl?.getBoundingClientRect();

    const scroll = {
      x: (view?.scrollX || 0) - (portalContainerRect?.left ?? 0),
      y: (view?.scrollY || 0) - (portalContainerRect?.top ?? 0),
    };

    const style: CSSProperties = {
      left: `${rect.left + scroll.x}px`,
      top: `${rect.top + scroll.y}px`,
      height: `${rect.height}px`,
      width: `${rect.width}px`,
    };

    return style;
  }, [ref, overlayRef, iframe]);

  const [style, setStyle] = useState<CSSProperties>();

  const sync = useCallback(() => {
    setStyle(getStyle());
  }, [ref, overlayRef, iframe]);

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

    if (thisIsDragging) {
      el.setAttribute("data-puck-dragging", "");
    } else {
      el.removeAttribute("data-puck-dragging");
    }

    return () => {
      el.removeAttribute("data-puck-component");
      el.removeEventListener("click", onClick);
      el.removeEventListener("mouseover", _onMouseOver);
      el.removeEventListener("mouseout", _onMouseOut);
      el.removeAttribute("data-puck-dragging");
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

  useEffect(() => {
    if (ref.current && disabled) {
      ref.current.setAttribute("data-puck-disabled", "");

      return () => {
        ref.current?.removeAttribute("data-puck-disabled");
      };
    }
  }, [disabled, ref]);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    sync();

    if ((isSelected || hover || indicativeHover) && !userIsDragging) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isSelected, hover, indicativeHover, iframe, state.data, userIsDragging]);

  const [actionsWidth, setActionsWidth] = useState(250);
  const actionsRef = useRef<HTMLDivElement>(null);

  const updateActionsWidth = useCallback(() => {
    if (actionsRef.current) {
      const rect = actionsRef.current!.getBoundingClientRect();

      setActionsWidth(rect.width);
    }
  }, []);

  useEffect(updateActionsWidth, [
    actionsRef.current,
    zoomConfig.zoom,
    isSelected,
  ]);

  useEffect(() => {
    if (userDragAxis) {
      setDragAxis(userDragAxis);
      return;
    }

    if (ref.current) {
      const computedStyle = window.getComputedStyle(ref.current);

      if (
        computedStyle.display === "inline" ||
        computedStyle.display === "inline-block"
      ) {
        setDragAxis("x");

        return;
      }
    }

    setDragAxis(autoDragAxis);
  }, [ref, userDragAxis, autoDragAxis]);

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
              isSelected,
              isDragging: thisIsDragging,
              isModifierHeld,
              hover: hover || indicativeHover,
            })}
            ref={overlayRef}
            style={{ ...style }}
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
                // Offset against left of frame
                minWidth: actionsWidth + 2 * actionsRight,
              }}
            >
              <div
                className={getClassName("actions")}
                style={{
                  transform: `scale(${1 / zoomConfig.zoom}`,
                  top: actionsTop / zoomConfig.zoom,
                  right: actionsRight / zoomConfig.zoom,
                }}
                ref={actionsRef}
              >
                <CustomActionBar label={DEBUG ? id : label}>
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
          portalEl || document.body
        )}
      {children(refSetter)}
    </DropZoneProvider>
  );
};
