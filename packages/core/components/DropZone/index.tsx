import { CSSProperties, useEffect, useState } from "react";
import { DraggableComponent } from "../DraggableComponent";
import { Droppable } from "@hello-pangea/dnd";
import { getItem } from "../../lib/get-item";
import { setupZone } from "../../lib/setup-zone";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { getClassNameFactory } from "../../lib";
import styles from "./styles.module.css";
import {
  useDropZoneContext,
  useDropZoneEditContext,
  useDropZoneRenderContext,
  DropZoneEditProvider,
  DropZoneRenderProvider,
} from "./context";
import { getZoneId } from "../../lib/get-zone-id";
import { useAppContext } from "../Puck/context";

const getClassName = getClassNameFactory("DropZone", styles);

export { DropZoneRenderProvider, DropZoneEditProvider } from "./context";

type DropZoneProps = {
  zone: string;
  allow?: string[];
  disallow?: string[];
  style?: CSSProperties;
};

function DropZoneEdit({ zone, allow, disallow, style }: DropZoneProps) {
  const appContext = useAppContext();

  const ctx = useDropZoneEditContext();

  const {
    // These all need setting via context
    data,
    dispatch,
    config,
    itemSelector,
    setItemSelector,
    areaId,
    draggedItem,
    placeholderStyle,
    hoveringZone,
    setHoveringZone,
    setHoveringComponent,
    hoveringArea,
    setHoveringArea,
    registerPath,
    registerZone,
    registerZoneArea,
    unregisterZone,
    areasWithZones,
    hoveringComponent,
    disableZoom = false,
  } = ctx;

  let content = data.content || [];
  let zoneCompound = rootDroppableId;

  useEffect(() => {
    if (areaId) {
      registerZoneArea(areaId);
    }
  }, [areaId]);

  // Register and unregister zone on mount
  useEffect(() => {
    registerZone(zoneCompound);
    return () => {
      unregisterZone(zoneCompound);
    };
  }, []);

  if (areaId) {
    if (zone !== rootDroppableId) {
      zoneCompound = `${areaId}:${zone}`;
      content = setupZone(data, zoneCompound).zones[zoneCompound];
    }
  }

  const isRootZone =
    zoneCompound === rootDroppableId ||
    zone === rootDroppableId ||
    areaId === "root";

  const draggedSourceId = draggedItem && draggedItem.source.droppableId;
  const draggedDestinationId =
    draggedItem && draggedItem.destination?.droppableId;
  const [zoneArea] = getZoneId(zoneCompound);

  // we use the index rather than spread to prevent down-level iteration warnings: https://stackoverflow.com/questions/53441292/why-downleveliteration-is-not-on-by-default
  const [draggedSourceArea] = getZoneId(draggedSourceId);

  const [userWillDrag, setUserWillDrag] = useState(false);

  const userIsDragging = !!draggedItem;
  const draggingOverArea = userIsDragging && zoneArea === draggedSourceArea;
  const draggingNewComponent = draggedSourceId?.startsWith("component-list");

  const hoveringOverArea = hoveringArea
    ? hoveringArea === zoneArea
    : isRootZone;
  const hoveringOverZone = hoveringZone === zoneCompound;

  let isEnabled = userWillDrag;

  /**
   * We enable zones when:
   *
   * 1. This is a new component and the user is dragging over the area. This
   *    check prevents flickering if you move cursor outside of zone
   *    but within the area
   * 2. This is an existing component and the user a) is dragging over the
   *    area (which prevents drags between zone areas, breaking the rules
   *    of @hello-pangea/dnd) and b) has the cursor hovering directly over
   *    the specific zone (which increases robustness when using flex
   *    layouts)
   */
  if (userIsDragging) {
    if (draggingNewComponent) {
      isEnabled = hoveringOverArea;
    } else {
      isEnabled = draggingOverArea && hoveringOverZone;
    }
  }

  if (isEnabled && userIsDragging && (allow || disallow)) {
    const [_, componentType] = draggedItem.draggableId.split("::");

    if (disallow) {
      const defaultedAllow = allow || [];

      // remove any explicitly allowed items from disallow
      const filteredDisallow = (disallow || []).filter(
        (item) => defaultedAllow.indexOf(item) === -1
      );

      if (filteredDisallow.indexOf(componentType) !== -1) {
        isEnabled = false;
      }
    } else if (allow) {
      if (allow.indexOf(componentType) === -1) {
        isEnabled = false;
      }
    }
  }

  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const isAreaSelected = selectedItem && zoneArea === selectedItem.props.id;

  return (
    <div
      className={getClassName({
        isRootZone,
        userIsDragging,
        draggingOverArea,
        hoveringOverArea,
        draggingNewComponent,
        isDestination: draggedDestinationId === zoneCompound,
        isDisabled: !isEnabled,
        isAreaSelected,
        hasChildren: content.length > 0,
        zoomEnabled: !disableZoom,
      })}
    >
      <Droppable
        droppableId={zoneCompound}
        direction={"vertical"}
        isDropDisabled={!isEnabled}
      >
        {(provided, snapshot) => {
          return (
            <div
              {...(provided || { droppableProps: {} }).droppableProps}
              className={getClassName("content")}
              ref={provided?.innerRef}
              style={style}
              id={zoneCompound}
              onMouseOver={(e) => {
                e.stopPropagation();
                setHoveringArea(zoneArea);
                setHoveringZone(zoneCompound);
              }}
            >
              {content.map((item, i) => {
                const componentId = item.props.id;

                const defaultedProps = {
                  ...config.components[item.type]?.defaultProps,
                  ...item.props,
                  puck: { renderDropZone: DropZone },
                  editMode: true,
                };

                const isSelected =
                  selectedItem?.props.id === componentId || false;

                const isDragging =
                  (draggedItem?.draggableId || "draggable-").split(
                    "draggable-"
                  )[1] === componentId;

                const containsZone = areasWithZones
                  ? areasWithZones[componentId]
                  : false;

                const Render = config.components[item.type]
                  ? config.components[item.type].render
                  : () => (
                      <div style={{ padding: 48, textAlign: "center" }}>
                        No configuration for {item.type}
                      </div>
                    );

                return (
                  <div
                    key={componentId}
                    className={getClassName("item")}
                    style={{ zIndex: isDragging ? 1 : undefined }}
                  >
                    <DropZoneEditProvider
                      value={{
                        ...ctx,
                        areaId: componentId,
                      }}
                    >
                      <DraggableComponent
                        label={item.type.toString()}
                        id={`draggable-${componentId}`}
                        index={i}
                        isSelected={isSelected}
                        isLocked={userIsDragging}
                        forceHover={
                          hoveringComponent === componentId && !userIsDragging
                        }
                        indicativeHover={
                          userIsDragging &&
                          containsZone &&
                          hoveringArea === componentId
                        }
                        isLoading={
                          appContext.componentState[componentId]?.loading
                        }
                        onMount={() => {
                          registerPath({
                            index: i,
                            zone: zoneCompound,
                          });
                        }}
                        onClick={(e) => {
                          setItemSelector({
                            index: i,
                            zone: zoneCompound,
                          });
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setUserWillDrag(true);
                        }}
                        onMouseUp={(e) => {
                          e.stopPropagation();
                          setUserWillDrag(false);
                        }}
                        onMouseOver={(e) => {
                          e.stopPropagation();

                          if (containsZone) {
                            setHoveringArea(componentId);
                          } else {
                            setHoveringArea(zoneArea);
                          }

                          setHoveringComponent(componentId);

                          setHoveringZone(zoneCompound);
                        }}
                        onMouseOut={() => {
                          setHoveringArea(null);
                          setHoveringZone(null);
                          setHoveringComponent(null);
                        }}
                        onDelete={(e) => {
                          dispatch({
                            type: "remove",
                            index: i,
                            zone: zoneCompound,
                          });

                          setItemSelector(null);

                          e.stopPropagation();
                        }}
                        onDuplicate={(e) => {
                          dispatch({
                            type: "duplicate",
                            sourceIndex: i,
                            sourceZone: zoneCompound,
                          });

                          setItemSelector({
                            zone: zoneCompound,
                            index: i + 1,
                          });

                          e.stopPropagation();
                        }}
                        style={{
                          pointerEvents:
                            userIsDragging && draggingNewComponent
                              ? "all"
                              : undefined,
                        }}
                      >
                        <div className={getClassName("renderWrapper")}>
                          <Render {...defaultedProps} />
                        </div>
                      </DraggableComponent>
                    </DropZoneEditProvider>
                    {userIsDragging && (
                      <div
                        className={getClassName("hitbox")}
                        onMouseOver={(e) => {
                          e.stopPropagation();
                          setHoveringArea(zoneArea);
                          setHoveringZone(zoneCompound);
                        }}
                      />
                    )}
                  </div>
                );
              })}
              {provided?.placeholder}
              {snapshot?.isDraggingOver && (
                <div
                  data-puck-placeholder
                  style={{
                    ...placeholderStyle,
                    background: "var(--puck-color-azure-06)",
                    opacity: 0.3,
                    zIndex: 0,
                  }}
                />
              )}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
}

function DropZoneRender({ zone }: DropZoneProps) {
  const ctx = useDropZoneRenderContext();

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
    <>
      {content.map((item) => {
        const Component = config.components[item.type];

        if (Component) {
          return (
            <DropZoneRenderProvider
              key={item.props.id}
              value={{ data, config, areaId: item.props.id, mode: "render" }}
            >
              <Component.render
                {...item.props}
                puck={{ renderDropZone: DropZone }}
              />
            </DropZoneRenderProvider>
          );
        }

        return null;
      })}
    </>
  );
}

export function DropZone(props: DropZoneProps) {
  const ctx = useDropZoneContext();

  if (!ctx) {
    return <div>DropZone requires context to work.</div>;
  }

  if (ctx.mode === "edit") {
    return <DropZoneEdit {...props} />;
  }

  return <DropZoneRender {...props} />;
}
