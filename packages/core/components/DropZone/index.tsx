import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { DraggableComponent } from "../DraggableComponent";
import { getItem } from "../../lib/get-item";
import { setupZone } from "../../lib/setup-zone";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { getClassNameFactory } from "../../lib";
import styles from "./styles.module.css";
import { DropZoneProvider, dropZoneContext } from "./context";
import { getZoneId } from "../../lib/get-zone-id";
import { useAppContext } from "../Puck/context";
import { DropZoneProps } from "./types";
import { ComponentConfig, PuckContext } from "../../types/Config";

import { useDroppable } from "@dnd-kit/react";
import { DrawerItemInner } from "../Drawer";
import { pointerIntersection } from "@dnd-kit/collision";
import { insert } from "../../lib/insert";
import { DragAxis } from "../DraggableComponent/collision/dynamic/get-direction";

const getClassName = getClassNameFactory("DropZone", styles);

export { DropZoneProvider, dropZoneContext } from "./context";

function DropZoneEdit({
  zone,
  allow,
  disallow,
  style,
  className,
  dragRef,
}: DropZoneProps) {
  const appContext = useAppContext();
  const ctx = useContext(dropZoneContext);

  const {
    // These all need setting via context
    data,
    config,
    areaId,
    draggedItem,
    placeholderStyle,
    registerZoneArea,
    areasWithZones,
    hoveringComponent,
    zoneWillDrag,
    setZoneWillDrag = () => null,
    collisionPriority,
    registerLocalZone,
  } = ctx! || {};

  const { itemSelector } = appContext.state.ui;

  const isDragging = !!draggedItem;

  let content = data.content || [];
  let zoneCompound = rootDroppableId;

  useEffect(() => {
    if (areaId && registerZoneArea) {
      registerZoneArea(areaId);
    }
  }, [areaId]);

  // Register and unregister zone on mount
  useEffect(() => {
    if (registerLocalZone) {
      registerLocalZone(zoneCompound, isDroppableTarget());
    }

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
      content = setupZone(data, zoneCompound).zones[zoneCompound];
    }
  }

  const ref = useRef<HTMLDivElement | null>();

  const {
    hoveringArea = "root",
    setHoveringArea,
    hoveringZone,
    setHoveringZone,
    setHoveringComponent,
  } = ctx!;

  const isDroppableTarget = useCallback(() => {
    if (!isDragging) {
      // console.log("not dragging");
      return true;
    }

    const { componentType } = draggedItem.data;

    if (disallow) {
      // console.log("has disallow");

      const defaultedAllow = allow || [];

      // remove any explicitly allowed items from disallow
      const filteredDisallow = (disallow || []).filter(
        (item) => defaultedAllow.indexOf(item) === -1
      );

      if (filteredDisallow.indexOf(componentType) !== -1) {
        // console.log("dragged item is disallowed");

        return false;
      }
    } else if (allow) {
      // console.log("has allow");
      if (allow.indexOf(componentType) === -1) {
        // console.log("dragged item is not allowed");

        return false;
      }
    }

    // console.log("default");

    return true;
  }, [draggedItem]);

  // Don't combine inline event handlers and event listeners, as they don't bubble together
  useEffect(() => {
    if (!ref.current) return;

    const onMouseOver = (e: Event) => {
      if (!setHoveringArea || !setHoveringZone) return;

      // Eject if this zone isn't droppable for the item
      // console.log(
      //   `${zoneCompound} (hover) isDroppableTarget ${isDroppableTarget()}`
      // );
      if (!isDroppableTarget()) {
        console.log(`${zoneCompound} is not a droppable target`);

        // setHoveringArea(zoneArea);

        return;
      }

      // e.stopPropagation();

      // console.log("dz", e.currentTarget, e.target, areaId, zoneCompound);

      setHoveringArea(areaId || zoneArea);
      setHoveringZone(zoneCompound);
    };

    ref.current.addEventListener("mouseover", onMouseOver);

    return () => {
      ref.current?.removeEventListener("mouseover", onMouseOver);
    };
  }, [ref, isDroppableTarget]);

  useEffect(() => {
    if (registerLocalZone) {
      registerLocalZone(zoneCompound, isDroppableTarget());
    }
  }, [isDragging, zoneCompound]);

  const isRootZone =
    zoneCompound === rootDroppableId ||
    zone === rootDroppableId ||
    areaId === "root";

  // const draggedSourceId = draggedItem && draggedItem.source.droppableId;
  // const draggedDestinationId =
  //   draggedItem && draggedItem.destination?.droppableId;
  const [zoneArea] = getZoneId(zoneCompound);

  // we use the index rather than spread to prevent down-level iteration warnings: https://stackoverflow.com/questions/53441292/why-downleveliteration-is-not-on-by-default
  // const [draggedSourceArea] = getZoneId(draggedSourceId);

  const userWillDrag = zoneWillDrag === zone;

  const hoveringOverArea = hoveringArea ? hoveringArea === areaId : isRootZone;
  const hoveringOverZone = hoveringZone === zoneCompound;

  const userIsDragging = !!draggedItem;
  const draggingOverArea = userIsDragging && hoveringOverArea;
  const draggingNewComponent = false; //draggedSourceId?.startsWith("component-list");

  // if (
  //   !ctx?.config ||
  //   !ctx.setHoveringArea ||
  //   !ctx.setHoveringZone ||
  //   !ctx.setHoveringComponent ||
  //   !ctx.setItemSelector ||
  //   !ctx.registerPath ||
  //   !ctx.dispatch
  // ) {
  //   return <div>DropZone requires context to work.</div>;
  // }

  let isEnabled = true;

  if (draggedItem) {
    isEnabled = hoveringOverArea && hoveringOverZone;
  }

  if (isEnabled) {
    isEnabled = isDroppableTarget();
  }

  const isDropEnabled = isEnabled && content.length === 0;

  const { ref: dropRef } = useDroppable({
    id: zoneCompound,
    collisionPriority: isEnabled ? collisionPriority : 0,
    disabled: !isDropEnabled,
    collisionDetector: pointerIntersection,
    data: {
      zone: true,
    },
  });

  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const isAreaSelected = selectedItem && areaId === selectedItem.props.id;

  const { preview } = appContext.state.ui;

  const contentWithPreview =
    preview?.zone === zoneCompound
      ? insert(content, preview.index, {
          type: "preview",
          props: { id: preview.id },
        })
      : content;

  const [dragAxis, setDragAxis] = useState<DragAxis>("y");

  useEffect(() => {
    if (ref.current) {
      const computedStyle = window.getComputedStyle(ref.current);

      if (computedStyle.display === "grid") {
        setDragAxis("dynamic");
      } else if (
        computedStyle.display === "flex" &&
        computedStyle.flexDirection === "row"
      ) {
        setDragAxis("dynamic");
      } else {
        setDragAxis("y");
      }
    }
  }, [ref]);

  return (
    <div
      className={`${getClassName({
        isRootZone,
        userIsDragging,
        draggingOverArea,
        // hoveringOverArea,
        draggingNewComponent,
        // isDestination: draggedDestinationId === zoneCompound,
        isDisabled: !isEnabled,
        isAreaSelected,
        hasChildren: content.length > 0,
      })}${className ? ` ${className}` : ""}`}
      ref={(node) => {
        ref.current = node;

        // if (isEnabled) {
        dropRef(node);
        if (dragRef) dragRef(node);
        // }
      }}
      style={style}
    >
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

        // const containsZone = areasWithZones
        //   ? areasWithZones[componentId]
        //   : false;

        let Render = config.components[item.type]
          ? config.components[item.type].render
          : () => (
              <div style={{ padding: 48, textAlign: "center" }}>
                No configuration for {item.type}
              </div>
            );

        const componentConfig: ComponentConfig | undefined =
          config.components[item.type];

        let componentType = item.type;

        let label = componentConfig?.["label"] ?? item.type.toString();

        if (item.type === "preview") {
          componentType = preview!.componentType;

          label =
            config.components[componentType]?.label ?? preview!.componentType;

          Render = () => <DrawerItemInner name={label} />;
        }

        return (
          <DraggableComponent
            key={componentId}
            id={componentId}
            componentType={componentType}
            zoneCompound={zoneCompound}
            collisionPriority={collisionPriority + 1}
            index={i}
            isLoading={appContext.componentState[componentId]?.loading}
            isSelected={isSelected}
            label={label}
            isEnabled={isEnabled}
            dragAxis={dragAxis}
            inDroppableZone={isDroppableTarget()}
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
                collisionPriority: 1,
              }}
            >
              <Component.render
                {...item.props}
                puck={{ renderDropZone: DropZone }}
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
