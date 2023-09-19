import { CSSProperties, useContext, useEffect } from "react";
import { DraggableComponent } from "../DraggableComponent";
import DroppableStrictMode from "../DroppableStrictMode";
import { getItem } from "../../lib/get-item";
import { setupDropzone } from "../../lib/setup-dropzone";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { getClassNameFactory } from "../../lib";
import styles from "./styles.module.css";
import { DropZoneProvider, dropZoneContext } from "./context";
import { getDropzoneId } from "../../lib/get-dropzone-id";

const getClassName = getClassNameFactory("DropZone", styles);

export { DropZoneProvider, dropZoneContext } from "./context";

type DropZoneProps = {
  dropzone: string;
  direction?: "vertical" | "horizontal";
  style?: CSSProperties;
};

function DropZoneEdit({
  dropzone,
  direction = "vertical",
  style,
}: DropZoneProps) {
  const ctx = useContext(dropZoneContext);

  const {
    // These all need setting via context
    data,
    dispatch = () => null,
    config,
    itemSelector,
    setItemSelector = () => null,
    areaId,
    draggedItem,
    placeholderStyle,
    registerDropzoneArea,
    areasWithDropzones,
    hoveringComponent,
  } = ctx! || {};

  let content = data.content || [];
  let dropzoneCompound = rootDroppableId;

  useEffect(() => {
    if (areaId && registerDropzoneArea) {
      registerDropzoneArea(areaId);
    }
  }, [areaId]);

  // Register and unregister dropzone on mount
  useEffect(() => {
    if (ctx?.registerDropzone) {
      ctx?.registerDropzone(dropzoneCompound);
    }

    return () => {
      if (ctx?.unregisterDropzone) {
        ctx?.unregisterDropzone(dropzoneCompound);
      }
    };
  }, []);

  if (areaId) {
    if (dropzone !== rootDroppableId) {
      dropzoneCompound = `${areaId}:${dropzone}`;
      content = setupDropzone(data, dropzoneCompound).dropzones[
        dropzoneCompound
      ];
    }
  }

  const isRootDropzone =
    dropzoneCompound === rootDroppableId ||
    dropzone === rootDroppableId ||
    areaId === "root";

  const draggedSourceId = draggedItem && draggedItem.source.droppableId;
  const draggedDestinationId =
    draggedItem && draggedItem.destination?.droppableId;
  const [dropzoneArea] = getDropzoneId(dropzoneCompound);

  // we use the index rather than spread to prevent down-level iteration warnings: https://stackoverflow.com/questions/53441292/why-downleveliteration-is-not-on-by-default
  const [draggedSourceArea] = getDropzoneId(draggedSourceId);

  const userIsDragging = !!draggedItem;
  const draggingOverArea = userIsDragging && dropzoneArea === draggedSourceArea;
  const draggingNewComponent = draggedSourceId === "component-list";

  if (
    !ctx?.config ||
    !ctx.setHoveringArea ||
    !ctx.setHoveringDropzone ||
    !ctx.setHoveringComponent ||
    !ctx.setItemSelector ||
    !ctx.registerPath ||
    !ctx.dispatch
  ) {
    return <div>DropZone requires context to work.</div>;
  }

  const {
    hoveringArea = "root",
    setHoveringArea,
    hoveringDropzone,
    setHoveringDropzone,
    setHoveringComponent,
  } = ctx;

  const hoveringOverArea = hoveringArea
    ? hoveringArea === dropzoneArea
    : isRootDropzone;
  const hoveringOverDropzone = hoveringDropzone === dropzoneCompound;

  let isEnabled = false;

  /**
   * We enable dropzones when:
   *
   * 1. This is a new component and the user is dragging over the area. This
   *    check prevents flickering if you move cursor outside of dropzone
   *    but within the area
   * 2. This is an existing component and the user a) is dragging over the
   *    area (which prevents drags between dropzone areas, breaking the rules
   *    of react-beautiful-dnd) and b) has the cursor hovering directly over
   *    the specific dropzone (which increases robustness when using flex
   *    layouts)
   */
  if (userIsDragging) {
    if (draggingNewComponent) {
      isEnabled = hoveringOverArea;
    } else {
      isEnabled = draggingOverArea && hoveringOverDropzone;
    }
  }

  const selectedItem = itemSelector ? getItem(itemSelector, data) : null;
  const isAreaSelected = selectedItem && dropzoneArea === selectedItem.props.id;

  return (
    <div
      className={getClassName({
        isRootDropzone,
        userIsDragging,
        draggingOverArea,
        hoveringOverArea,
        draggingNewComponent,
        isDestination: draggedDestinationId === dropzoneCompound,
        isDisabled: !isEnabled,
        isAreaSelected,
      })}
    >
      <DroppableStrictMode
        droppableId={dropzoneCompound}
        direction={direction}
        isDropDisabled={!isEnabled}
      >
        {(provided, snapshot) => {
          return (
            <div
              {...(provided || { droppableProps: {} }).droppableProps}
              className={getClassName("content")}
              ref={provided?.innerRef}
              style={style}
              id={dropzoneCompound}
              onMouseOver={(e) => {
                e.stopPropagation();
                setHoveringArea(dropzoneArea);
                setHoveringDropzone(dropzoneCompound);
              }}
            >
              {content.map((item, i) => {
                const componentId = item.props.id;

                const defaultedProps = {
                  ...config.components[item.type]?.defaultProps,
                  ...item.props,
                  editMode: true,
                };

                const isSelected =
                  selectedItem?.props.id === componentId || false;

                const containsDropzone = areasWithDropzones
                  ? areasWithDropzones[componentId]
                  : false;

                const Render = config.components[item.type]
                  ? config.components[item.type].render
                  : () => (
                      <div style={{ padding: 48, textAlign: "center" }}>
                        No configuration for {item.type}
                      </div>
                    );

                return (
                  <div key={item.props.id} className={getClassName("item")}>
                    <DropZoneProvider
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
                          containsDropzone &&
                          hoveringArea === componentId
                        }
                        onMount={() => {
                          ctx.registerPath!({
                            index: i,
                            dropzone: dropzoneCompound,
                          });
                        }}
                        onClick={(e) => {
                          setItemSelector({
                            index: i,
                            dropzone: dropzoneCompound,
                          });
                          e.stopPropagation();
                        }}
                        onMouseOver={(e) => {
                          e.stopPropagation();

                          if (containsDropzone) {
                            setHoveringArea(componentId);
                          } else {
                            setHoveringArea(dropzoneArea);
                          }

                          setHoveringComponent(componentId);

                          setHoveringDropzone(dropzoneCompound);
                        }}
                        onMouseOut={() => {
                          setHoveringArea(null);
                          setHoveringDropzone(null);
                          setHoveringComponent(null);
                        }}
                        onDelete={(e) => {
                          dispatch({
                            type: "remove",
                            index: i,
                            dropzone: dropzoneCompound,
                          });

                          setItemSelector(null);

                          e.stopPropagation();
                        }}
                        onDuplicate={(e) => {
                          dispatch({
                            type: "duplicate",
                            sourceIndex: i,
                            sourceDropzone: dropzoneCompound,
                          });

                          setItemSelector({
                            dropzone: dropzoneCompound,
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
                        <div style={{ zoom: 0.75 }}>
                          <Render {...defaultedProps} />
                        </div>
                      </DraggableComponent>
                    </DropZoneProvider>
                    {userIsDragging && (
                      <div
                        className={getClassName("hitbox")}
                        onMouseOver={(e) => {
                          e.stopPropagation();
                          setHoveringArea(dropzoneArea);
                          setHoveringDropzone(dropzoneCompound);
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
                    background: "var(--puck-color-azure-5)",
                    opacity: 0.3,
                    zIndex: 0,
                  }}
                />
              )}
            </div>
          );
        }}
      </DroppableStrictMode>
    </div>
  );
}

function DropZoneRender({ dropzone }: DropZoneProps) {
  const ctx = useContext(dropZoneContext);

  const { data, areaId = "root", config } = ctx || {};

  let dropzoneCompound = rootDroppableId;
  let content = data?.content || [];

  if (!data || !config) {
    return null;
  }

  if (areaId && dropzone && dropzone !== rootDroppableId) {
    dropzoneCompound = `${areaId}:${dropzone}`;
    content = setupDropzone(data, dropzoneCompound).dropzones[dropzoneCompound];
  }

  return (
    <>
      {content.map((item) => {
        const Component = config.components[item.type];

        if (Component) {
          return (
            <DropZoneProvider
              key={item.props.id}
              value={{ data, config, areaId: item.props.id }}
            >
              <Component.render {...item.props} />
            </DropZoneProvider>
          );
        }

        return null;
      })}
    </>
  );
}

export function DropZone(props: DropZoneProps) {
  const ctx = useContext(dropZoneContext);

  if (ctx?.mode === "edit") {
    return <DropZoneEdit {...props} />;
  }

  return <DropZoneRender {...props} />;
}
