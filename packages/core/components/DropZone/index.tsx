import {
  CSSProperties,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DraggableComponent } from "../DraggableComponent";
import { getItem } from "../../lib/get-item";
import { setupZone } from "../../lib/setup-zone";
import { rootDroppableId } from "../../lib/root-droppable-id";
import { getClassNameFactory } from "../../lib";
import styles from "./styles.module.css";
import {
  DropZoneProvider,
  Preview,
  dropZoneContext,
  useZoneStore,
} from "./context";
import { useAppContext } from "../Puck/context";
import { DropZoneProps } from "./types";
import { ComponentConfig, Content, DragAxis, PuckContext } from "../../types";

import { UseDroppableInput } from "@dnd-kit/react";
import { DrawerItemInner } from "../Drawer";
import { pointerIntersection } from "@dnd-kit/collision";
import { insert } from "../../lib/insert";
import { UniqueIdentifier } from "@dnd-kit/abstract";
import { useDroppableSafe } from "../../lib/dnd-kit/safe";
import { useMinEmptyHeight } from "./use-min-empty-height";
import { assignRefs } from "../../lib/assign-refs";
import { useShallow } from "zustand/react/shallow";
import { useRenderedCallback } from "../../lib/dnd-kit/use-rendered-callback";

const getClassName = getClassNameFactory("DropZone", styles);

export { DropZoneProvider, dropZoneContext } from "./context";

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const RENDER_DEBUG = false;

const GRID_DRAG_AXIS: DragAxis = "dynamic";
const FLEX_ROW_DRAG_AXIS: DragAxis = "x";
const DEFAULT_DRAG_AXIS: DragAxis = "y";

export type DropZoneDndData = {
  areaId?: string;
  depth: number;
  path: UniqueIdentifier[];
  isDroppableTarget: boolean;
};

const useContentWithPreview = (
  content: Content,
  providerId: string,
  zoneCompound: string
) => {
  const { draggedItemId, preview, previewExists } = useZoneStore(
    useShallow((s) => {
      const providerState = s[providerId];

      return {
        draggedItemId: providerState?.draggedItem?.id,
        preview: providerState?.previewIndex[zoneCompound],
        previewExists:
          Object.keys(providerState?.previewIndex || {}).length > 0,
      };
    })
  );

  const [contentWithPreview, setContentWithPreview] = useState(content);

  const updateContent = useRenderedCallback(
    (content: Content, preview: Preview | undefined) => {
      if (preview) {
        if (preview.type === "insert") {
          setContentWithPreview(
            insert(
              content.filter((item) => item.props.id !== preview.props.id),
              preview.index,
              {
                type: "preview",
                props: { id: preview.props.id },
              }
            )
          );
        } else {
          setContentWithPreview(
            insert(
              content.filter((item) => item.props.id !== preview.props.id),
              preview.index,
              {
                type: preview.componentType,
                props: preview.props,
              }
            )
          );
        }
      } else {
        setContentWithPreview(
          previewExists
            ? content.filter((item) => item.props.id !== draggedItemId)
            : content
        );
      }
    },
    [draggedItemId, previewExists]
  );

  useEffect(() => {
    updateContent(content, preview);
  }, [content, preview]);

  return contentWithPreview;
};

const DropZoneEdit = forwardRef<HTMLDivElement, DropZoneProps>(
  function DropZoneEdit(
    {
      zone,
      allow,
      disallow,
      style,
      className,
      minEmptyHeight: userMinEmptyHeight = 128,
      collisionAxis,
    },
    userRef
  ) {
    const appContext = useAppContext();
    const ctx = useContext(dropZoneContext);

    const {
      // These all need setting via context
      data,
      config,
      areaId,
      registerZoneArea,
      depth,
      registerLocalZone,
      unregisterLocalZone,
      path = [],
      activeZones,
      providerId,
    } = ctx!;

    let zoneCompound = rootDroppableId;

    if (areaId) {
      if (zone !== rootDroppableId) {
        zoneCompound = `${areaId}:${zone}`;
      }
    }

    const isRootZone =
      zoneCompound === rootDroppableId ||
      zone === rootDroppableId ||
      areaId === "root";

    const {
      isDeepestZone,
      inNextDeepestArea,
      draggedComponentType,
      userIsDragging,
      preview,
    } = useZoneStore(
      useShallow((s) => {
        const providerState = s[providerId];

        return {
          isDeepestZone: providerState?.zoneDepthIndex[zoneCompound] ?? false,
          inNextDeepestArea: providerState?.nextAreaDepthIndex[areaId || ""],
          draggedItemId: providerState?.draggedItem?.id,
          draggedComponentType: providerState?.draggedItem?.data.componentType,
          userIsDragging: !!providerState?.draggedItem,
          preview: providerState?.previewIndex[zoneCompound],
        };
      })
    );

    const { itemSelector } = appContext.state.ui;

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

    const content = useMemo(() => {
      if (areaId && zone !== rootDroppableId) {
        return setupZone(data, zoneCompound).zones[zoneCompound];
      }

      return data.content || [];
    }, [data, zoneCompound]);

    const ref = useRef<HTMLDivElement | null>(null);

    const acceptsTarget = useCallback(
      (componentType: string | null | undefined) => {
        if (!componentType) {
          return true;
        }

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
        registerLocalZone(zoneCompound, acceptsTarget(draggedComponentType));
      }

      return () => {
        if (unregisterLocalZone) {
          unregisterLocalZone(zoneCompound);
        }
      };
    }, [draggedComponentType, zoneCompound]);

    const hoveringOverArea = inNextDeepestArea || isRootZone;

    let isEnabled = true;

    if (userIsDragging) {
      isEnabled = isDeepestZone;
    }

    if (isEnabled) {
      isEnabled = acceptsTarget(draggedComponentType);
    }

    const contentWithPreview = useContentWithPreview(
      content,
      providerId,
      zoneCompound
    );

    const isDropEnabled =
      isEnabled &&
      (preview
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
        isDroppableTarget: acceptsTarget(draggedComponentType),
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

    const [minEmptyHeight, isAnimating] = useMinEmptyHeight({
      zoneCompound,
      userMinEmptyHeight,
      ref,
      providerId,
    });

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
          isAnimating,
        })}${className ? ` ${className}` : ""}`}
        ref={(node) => {
          assignRefs<HTMLDivElement>([ref, dropRef, userRef], node);
        }}
        data-testid={`dropzone:${zoneCompound}`}
        data-puck-dropzone={zoneCompound}
        data-puck-dnd={zoneCompound}
        style={
          {
            ...style,
            "--min-empty-height": `${minEmptyHeight}px`,
            backgroundColor: RENDER_DEBUG ? getRandomColor() : undefined,
          } as CSSProperties
        }
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

          if (item.type === "preview" && preview) {
            componentType = preview.componentType;

            label =
              config.components[componentType]?.label ?? preview.componentType;

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
                inDroppableZone={acceptsTarget(draggedComponentType)}
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
);

const DropZoneRender = forwardRef<HTMLDivElement, DropZoneProps>(
  function DropZoneRender({ className, style, zone }, ref) {
    const ctx = useContext(dropZoneContext);

    const { data, areaId = "root", config } = ctx || {};

    let zoneCompound = rootDroppableId;
    let content = data?.content || [];

    // Register zones if running Render mode inside editor (i.e. previewMode === "interactive")
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

    if (!data || !config) {
      return null;
    }

    if (areaId && zone && zone !== rootDroppableId) {
      zoneCompound = `${areaId}:${zone}`;
      content = setupZone(data, zoneCompound).zones[zoneCompound];
    }

    return (
      <div className={className} style={style} ref={ref}>
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
                  providerId: "",
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
);

export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(
  function DropZone(props: DropZoneProps, ref) {
    const ctx = useContext(dropZoneContext);

    if (ctx?.mode === "edit") {
      return (
        <>
          <DropZoneEdit {...props} ref={ref} />
        </>
      );
    }

    return (
      <>
        <DropZoneRender {...props} ref={ref} />
      </>
    );
  }
);
