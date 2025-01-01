import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ComponentDndData, DraggableComponent } from "../DraggableComponent";
import { getItem } from "../../lib/get-item";
import { setupZone } from "../../lib/setup-zone";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { getClassNameFactory } from "../../lib";
import styles from "./styles.module.css";
import { DropZoneProvider, dropZoneContext } from "./context";
import { useAppContext } from "../Puck/context";
import { DropZoneProps } from "./types";
import { ComponentConfig, DragAxis, PuckContext } from "../../types";

import { UseDroppableInput } from "@dnd-kit/react";
import { DrawerItemInner } from "../Drawer";
import { pointerIntersection } from "@dnd-kit/collision";
import { insert } from "../../lib/insert";
import { previewContext } from "../DragDropContext";
import { Draggable, UniqueIdentifier } from "@dnd-kit/abstract";
import { useDroppableSafe } from "../../lib/dnd-kit/safe";

const getClassName = getClassNameFactory("DropZone", styles);

export { DropZoneProvider, dropZoneContext } from "./context";

const DEBUG = false;

const GRID_DRAG_AXIS: DragAxis = "dynamic";
const FLEX_ROW_DRAG_AXIS: DragAxis = "x";
const DEFAULT_DRAG_AXIS: DragAxis = "y";

export type DropZoneDndData = {
  areaId?: string;
  depth: number;
  path: UniqueIdentifier[];
  isDroppableTarget: boolean;
};

function DropZoneEdit({
  zone,
  allow,
  disallow,
  style,
  className,
  minEmptyHeight = 128,
  dragRef,
  collisionAxis,
}: DropZoneProps) {
  const appContext = useAppContext();
  const ctx = useContext(dropZoneContext);

  const {
    // These all need setting via context
    data,
    config,
    areaId,
    draggedItem,
    registerZoneArea,
    depth,
    registerLocalZone,
    unregisterLocalZone,
    deepestZone = rootDroppableId,
    deepestArea,
    nextDeepestArea,
    path = [],
    activeZones,
  } = ctx!;

  const { itemSelector } = appContext.state.ui;

  let zoneCompound = rootDroppableId;

  useEffect(() => {
    if (areaId && registerZoneArea) {
      registerZoneArea(areaId);
    }
  }, [areaId]);

  // Register and unregister zone on mount
  useEffect(() => {
    if (ctx?.registerZone) {
      ctx?.registerZone(zoneCompound);
    }

    return () => {
      if (ctx?.unregisterZone) {
        ctx?.unregisterZone(zoneCompound);
      }
    };
  }, []);

  if (areaId) {
    if (zone !== rootDroppableId) {
      zoneCompound = `${areaId}:${zone}`;
    }
  }

  const content = useMemo(() => {
    if (areaId && zone !== rootDroppableId) {
      return setupZone(data, zoneCompound).zones[zoneCompound];
    }

    return data.content || [];
  }, [data, zoneCompound]);

  const ref = useRef<HTMLDivElement | null>(null);

  const acceptsTarget = useCallback(
    (target: Draggable | undefined | null) => {
      if (!target) {
        return true;
      }

      const data = target.data as ComponentDndData;

      const { componentType } = data;

      if (disallow) {
        const defaultedAllow = allow || [];

        // remove any explicitly allowed items from disallow
        const filteredDisallow = (disallow || []).filter(
          (item) => defaultedAllow.indexOf(item) === -1
        );

        if (filteredDisallow.indexOf(componentType) !== -1) {
          return false;
        }
      } else if (allow) {
        if (allow.indexOf(componentType) === -1) {
          return false;
        }
      }

      return true;
    },
    [allow, disallow]
  );

  useEffect(() => {
    if (registerLocalZone) {
      registerLocalZone(zoneCompound, acceptsTarget(draggedItem));
    }

    return () => {
      if (unregisterLocalZone) {
        unregisterLocalZone(zoneCompound);
      }
    };
  }, [draggedItem, zoneCompound]);

  const isRootZone =
    zoneCompound === rootDroppableId ||
    zone === rootDroppableId ||
    areaId === "root";

  const hoveringOverArea = nextDeepestArea
    ? nextDeepestArea === areaId
    : isRootZone;

  const userIsDragging = !!draggedItem;

  let isEnabled = true;

  if (draggedItem) {
    isEnabled = deepestZone === zoneCompound;
  }

  if (isEnabled) {
    isEnabled = acceptsTarget(draggedItem);
  }

  const preview = useContext(previewContext);

  const previewInZone = preview?.zone === zoneCompound;

  const contentWithPreview = useMemo(() => {
    let contentWithPreview = preview
      ? content.filter((item) => item.props.id !== preview.props.id)
      : content;

    if (previewInZone) {
      contentWithPreview = content.filter(
        (item) => item.props.id !== preview.props.id
      );

      if (preview.type === "insert") {
        contentWithPreview = insert(contentWithPreview, preview.index, {
          type: "preview",
          props: { id: preview.props.id },
        });
      } else {
        contentWithPreview = insert(contentWithPreview, preview.index, {
          type: preview.componentType,
          props: preview.props,
        });
      }
    }

    return contentWithPreview;
  }, [preview, content]);

  const isDropEnabled =
    isEnabled &&
    (previewInZone
      ? contentWithPreview.length === 1
      : contentWithPreview.length === 0);

  const droppableConfig: UseDroppableInput<DropZoneDndData> = {
    id: zoneCompound,
    collisionPriority: isEnabled ? depth : 0,
    disabled: !isDropEnabled,
    collisionDetector: pointerIntersection,
    type: "dropzone",
    data: {
      areaId,
      depth,
      isDroppableTarget: acceptsTarget(draggedItem),
      path,
    },
  };

  const { ref: dropRef } = useDroppableSafe(droppableConfig);

  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const isAreaSelected = selectedItem && areaId === selectedItem.props.id;

  const [dragAxis, setDragAxis] = useState<DragAxis>(
    collisionAxis || DEFAULT_DRAG_AXIS
  );

  const calculateDragAxis = useCallback(() => {
    if (ref.current) {
      const computedStyle = window.getComputedStyle(ref.current);

      if (computedStyle.display === "grid") {
        setDragAxis(GRID_DRAG_AXIS);
      } else if (
        computedStyle.display === "flex" &&
        computedStyle.flexDirection === "row"
      ) {
        setDragAxis(FLEX_ROW_DRAG_AXIS);
      } else {
        setDragAxis(DEFAULT_DRAG_AXIS);
      }
    }
  }, [ref.current]);

  useEffect(calculateDragAxis, [appContext.status, collisionAxis]);

  useEffect(() => {
    const onViewportChange = () => {
      calculateDragAxis();
    };

    window.addEventListener("viewportchange", onViewportChange);

    return () => {
      window.removeEventListener("viewportchange", onViewportChange);
    };
  }, []);

  return (
    <div
      className={`${getClassName({
        isRootZone,
        userIsDragging,
        hoveringOverArea,
        isEnabled,
        isAreaSelected,
        hasChildren: content.length > 0,
        isActive: activeZones?.[zoneCompound],
      })}${className ? ` ${className}` : ""}`}
      ref={(node) => {
        ref.current = node;

        dropRef(node);

        if (dragRef) dragRef(node);
      }}
      data-testid={`dropzone:${zoneCompound}`}
      data-puck-dropzone={zoneCompound}
      data-puck-dnd={zoneCompound}
      style={
        {
          ...style,
          "--min-empty-height": `${minEmptyHeight}px`,
        } as CSSProperties
      }
    >
      {isRootZone && DEBUG && (
        <div data-puck-component>
          <p>{deepestZone || rootDroppableId}</p>
          <p>{deepestArea || "No area"}</p>
        </div>
      )}

      {contentWithPreview.map((item, i) => {
        const componentId = item.props.id;

        const puckProps: PuckContext = {
          renderDropZone: DropZone,
          isEditing: true,
          dragRef: null,
        };

        const defaultedProps = {
          ...config.components[item.type]?.defaultProps,
          ...item.props,
          puck: puckProps,
          editMode: true, // DEPRECATED
        };

        const isSelected = selectedItem?.props.id === componentId || false;

        let Render = config.components[item.type]
          ? config.components[item.type].render
          : () => (
              <div style={{ padding: 48, textAlign: "center" }}>
                No configuration for {item.type}
              </div>
            );

        const componentConfig: ComponentConfig | undefined =
          config.components[item.type];

        let componentType = item.type as string;

        let label = componentConfig?.["label"] ?? item.type.toString();

        if (item.type === "preview") {
          componentType = preview!.componentType;

          label =
            config.components[componentType]?.label ?? preview!.componentType;

          function Preview() {
            return <DrawerItemInner name={label} />;
          }

          Render = Preview;
        }

        return (
          <DropZoneProvider
            value={{ ...ctx!, path: [...path, zoneCompound] }}
            key={componentId}
          >
            <DraggableComponent
              id={componentId}
              componentType={componentType}
              zoneCompound={zoneCompound}
              depth={depth + 1}
              index={i}
              isLoading={
                appContext.componentState[componentId]?.loadingCount > 0
              }
              isSelected={isSelected}
              label={label}
              isEnabled={isEnabled}
              autoDragAxis={dragAxis}
              userDragAxis={collisionAxis}
              inDroppableZone={acceptsTarget(draggedItem)}
            >
              {(dragRef) =>
                componentConfig?.inline ? (
                  <Render
                    {...defaultedProps}
                    puck={{
                      ...defaultedProps.puck,
                      dragRef,
                    }}
                  />
                ) : (
                  <div ref={dragRef}>
                    <Render {...defaultedProps} />
                  </div>
                )
              }
            </DraggableComponent>
          </DropZoneProvider>
        );
      })}
    </div>
  );
}

function DropZoneRender({ className, style, zone }: DropZoneProps) {
  const ctx = useContext(dropZoneContext);

  const { data, areaId = "root", config } = ctx || {};

  let zoneCompound = rootDroppableId;
  let content = data?.content || [];

  if (!data || !config) {
    return null;
  }

  if (areaId && zone && zone !== rootDroppableId) {
    zoneCompound = `${areaId}:${zone}`;
    content = setupZone(data, zoneCompound).zones[zoneCompound];
  }

  return (
    <div className={className} style={style}>
      {content.map((item) => {
        const Component = config.components[item.type];

        if (Component) {
          return (
            <DropZoneProvider
              key={item.props.id}
              value={{
                data,
                config,
                areaId: item.props.id,
                depth: 1,
                path: [],
              }}
            >
              <Component.render
                {...item.props}
                puck={{ renderDropZone: DropZoneRender }}
              />
            </DropZoneProvider>
          );
        }

        return null;
      })}
    </div>
  );
}

export function DropZone(props: DropZoneProps) {
  const ctx = useContext(dropZoneContext);

  if (ctx?.mode === "edit") {
    return (
      <>
        <DropZoneEdit {...props} />
      </>
    );
  }

  return (
    <>
      <DropZoneRender {...props} />
    </>
  );
}
