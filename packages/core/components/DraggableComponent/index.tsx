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
import "./styles.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, CornerLeftUp, Trash } from "lucide-react";
import { useAppStore } from "../../stores/app-store";
import { Loader } from "../Loader";
import { ActionBar } from "../ActionBar";

import { createPortal } from "react-dom";

import { dropZoneContext, DropZoneProvider } from "../DropZone";
import { createDynamicCollisionDetector } from "../../lib/dnd/collision/dynamic";
import { DragAxis } from "../../types";
import { UniqueIdentifier } from "@dnd-kit/abstract";
import { useSortableSafe } from "../../lib/dnd/dnd-kit/safe";
import { getDeepScrollPosition } from "../../lib/get-deep-scroll-position";
import { ZoneStoreContext } from "../DropZone/context";
import { useContextStore } from "../../lib/use-context-store";
import { useNodeStore } from "../../stores/node-store";
import { usePermissionsStore } from "../../stores/permissions-store";
import { useShallow } from "zustand/react/shallow";

const getClassName = getClassNameFactory("DraggableComponent", styles);

const DEBUG = false;

// Magic numbers are used to position actions overlay 8px from top of component, bottom of component (when sticky scrolling) and side of preview
const space = 8;
const actionsOverlayTop = space * 6.5;
const actionsTop = -(actionsOverlayTop - 8);
const actionsSide = space;

const DefaultActionBar = ({
  label,
  children,
  parentAction,
}: {
  label: string | undefined;
  children: ReactNode;
  parentAction: ReactNode;
}) => (
  <ActionBar>
    <ActionBar.Group>
      {parentAction}
      {label && <ActionBar.Label label={label} />}
    </ActionBar.Group>
    <ActionBar.Group>{children}</ActionBar.Group>
  </ActionBar>
);

export type ComponentDndData = {
  areaId?: string;
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
  const zoom = useAppStore((s) =>
    s.selectedItem?.props.id === id ? s.zoomConfig.zoom : 1
  );
  const overrides = useAppStore((s) => s.overrides);
  const selectedItem = useAppStore((s) =>
    s.selectedItem?.props.id === id ? s.selectedItem : null
  );
  const dispatch = useAppStore((s) => s.dispatch);
  const iframe = useAppStore((s) => s.iframe);

  const ctx = useContext(dropZoneContext);

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

  const unregisterLocalZone = useCallback(
    (zoneCompound: string) => {
      // Propagate local zone
      ctx?.unregisterLocalZone?.(zoneCompound);

      setLocalZones((obj) => {
        const newLocalZones = {
          ...obj,
        };

        delete newLocalZones[zoneCompound];

        return newLocalZones;
      });
    },
    [setLocalZones]
  );

  const containsActiveZone =
    Object.values(localZones).filter(Boolean).length > 0;

  const path = useNodeStore((s) => s.nodes[id]?.path);

  const item = useNodeStore((s) => s.nodes[id]?.data);

  const permissions = usePermissionsStore(
    useShallow((s) => s.getPermissions({ item }))
  );

  const userIsDragging = useContextStore(
    ZoneStoreContext,
    (s) => !!s.draggedItem
  );

  const canCollide = permissions.drag || userIsDragging;

  const disabled = !isEnabled || !canCollide;

  const [dragAxis, setDragAxis] = useState(userDragAxis || autoDragAxis);

  const { ref: sortableRef, status } = useSortableSafe<ComponentDndData>({
    id,
    index,
    group: zoneCompound,
    type: "component",
    data: {
      areaId: ctx?.areaId,
      zone: zoneCompound,
      index,
      componentType,
      containsActiveZone,
      depth,
      path: path || [],
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

  const ref = useRef<HTMLElement>(null);

  const refSetter = useCallback(
    (el: HTMLElement | null) => {
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
      iframe.enabled
        ? ref.current?.ownerDocument.body
        : ref.current?.closest<HTMLElement>("[data-puck-preview]") ??
            document.body
    );
  }, [iframe.enabled, ref.current]);

  const getStyle = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current!.getBoundingClientRect();
    const deepScrollPosition = getDeepScrollPosition(ref.current);

    const portalContainerEl = iframe.enabled
      ? null
      : ref.current?.closest<HTMLElement>("[data-puck-preview]");

    const portalContainerRect = portalContainerEl?.getBoundingClientRect();
    const portalScroll = portalContainerEl
      ? getDeepScrollPosition(portalContainerEl)
      : { x: 0, y: 0 };

    const scroll = {
      x:
        deepScrollPosition.x -
        portalScroll.x -
        (portalContainerRect?.left ?? 0),
      y:
        deepScrollPosition.y - portalScroll.y - (portalContainerRect?.top ?? 0),
    };

    const style: CSSProperties = {
      left: `${rect.left + scroll.x}px`,
      top: `${rect.top + scroll.y}px`,
      height: `${rect.height}px`,
      width: `${rect.width}px`,
    };

    return style;
  }, [ref.current]);

  const [style, setStyle] = useState<CSSProperties>();

  const sync = useCallback(() => {
    setStyle(getStyle());
  }, [ref.current, iframe]);

  useEffect(() => {
    if (ref.current && !userIsDragging) {
      const observer = new ResizeObserver(sync);

      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [ref.current, userIsDragging]);

  const registerNode = useNodeStore((s) => s.registerNode);

  useEffect(() => {
    registerNode(id, { methods: { sync }, element: ref.current ?? null });

    return () => {
      registerNode(id, { methods: { sync: () => null }, element: null });
    };
  }, [id, zoneCompound, index, componentType, sync]);

  const CustomActionBar = useMemo(
    () => overrides.actionBar || DefaultActionBar,
    [overrides.actionBar]
  );

  const onClick = useCallback(
    (e: Event | SyntheticEvent) => {
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

  const onSelectParent = useCallback(() => {
    const { nodes } = useNodeStore.getState();
    const node = nodes[id];
    const parentNode = node?.parentId ? nodes[node?.parentId] : null;

    if (!parentNode) {
      return;
    }

    dispatch({
      type: "setUi",
      ui: {
        itemSelector: {
          zone: `${parentNode.parentId}:${parentNode.zone}`,
          index: parentNode.index,
        },
      },
    });
  }, [ctx, path]);

  const onDuplicate = useCallback(() => {
    dispatch({
      type: "duplicate",
      sourceIndex: index,
      sourceZone: zoneCompound,
    });
  }, [index, zoneCompound]);

  const onDelete = useCallback(() => {
    dispatch({
      type: "remove",
      index: index,
      zone: zoneCompound,
    });
  }, [index, zoneCompound]);

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
    el.setAttribute("data-puck-dnd", id);
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
      el.removeAttribute("data-puck-dnd");
      el.removeEventListener("click", onClick);
      el.removeEventListener("mouseover", _onMouseOver);
      el.removeEventListener("mouseout", _onMouseOut);
      el.removeAttribute("data-puck-dragging");
    };
  }, [
    ref,
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
  }, [isSelected, hover, indicativeHover, iframe, userIsDragging]);

  const syncActionsPosition = useCallback(
    (el: HTMLDivElement | null | undefined) => {
      if (el) {
        const view = el.ownerDocument.defaultView;

        if (view) {
          const rect = el.getBoundingClientRect();

          const diffLeft = rect.x;
          const exceedsBoundsLeft = diffLeft < 0;

          // Modify position if it spills over frame
          if (exceedsBoundsLeft) {
            el.style.transformOrigin = "left top";
            el.style.left = "0px";
          }
        }
      }
    },
    [zoom]
  );

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

  const parentAction = ctx?.areaId && ctx?.areaId !== "root" && (
    <ActionBar.Action onClick={onSelectParent} label="Select parent">
      <CornerLeftUp size={16} />
    </ActionBar.Action>
  );

  return (
    <DropZoneProvider
      value={{
        ...ctx!,
        areaId: id,
        zoneCompound,
        index,
        depth: depth + 1,
        registerLocalZone,
        unregisterLocalZone,
      }}
    >
      {isVisible &&
        createPortal(
          <div
            className={getClassName({
              isSelected,
              isDragging: thisIsDragging,
              hover: hover || indicativeHover,
            })}
            style={{ ...style }}
            data-puck-overlay
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
                top: actionsOverlayTop / zoom,
              }}
            >
              <div
                className={getClassName("actions")}
                style={{
                  transform: `scale(${1 / zoom}`,
                  top: actionsTop / zoom,
                  right: 0,
                  paddingLeft: actionsSide,
                  paddingRight: actionsSide,
                }}
                ref={syncActionsPosition}
              >
                <CustomActionBar
                  parentAction={parentAction}
                  label={DEBUG ? id : label}
                >
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
