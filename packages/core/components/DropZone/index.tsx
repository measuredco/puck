import {
  CSSProperties,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { DraggableComponent } from "../DraggableComponent";
import { setupZone } from "../../lib/data/setup-zone";
import {
  rootAreaId,
  rootDroppableId,
  rootZone,
} from "../../lib/root-droppable-id";
import { getClassNameFactory } from "../../lib";
import styles from "./styles.module.css";
import {
  DropZoneContext,
  DropZoneProvider,
  Preview,
  ZoneStoreContext,
  dropZoneContext,
} from "./context";
import { useAppStore } from "../../store";
import { DropZoneProps } from "./types";
import {
  ComponentData,
  Config,
  DragAxis,
  Metadata,
  PuckContext,
} from "../../types";

import { UseDroppableInput } from "@dnd-kit/react";
import { DrawerItemInner } from "../Drawer";
import { pointerIntersection } from "@dnd-kit/collision";
import { UniqueIdentifier } from "@dnd-kit/abstract";
import { useDroppableSafe } from "../../lib/dnd/dnd-kit/safe";
import { useMinEmptyHeight } from "./lib/use-min-empty-height";
import { assignRefs } from "../../lib/assign-refs";
import { useContentIdsWithPreview } from "./lib/use-content-with-preview";
import { useDragAxis } from "./lib/use-drag-axis";
import { useContextStore } from "../../lib/use-context-store";
import { useShallow } from "zustand/react/shallow";
import { renderContext } from "../Render";
import { useSlots } from "../../lib/use-slots";
import { ContextSlotRender, SlotRenderPure } from "../SlotRender";

const getClassName = getClassNameFactory("DropZone", styles);

export { DropZoneProvider, dropZoneContext } from "./context";

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

const RENDER_DEBUG = false;

export type DropZoneDndData = {
  areaId?: string;
  depth: number;
  path: UniqueIdentifier[];
  isDroppableTarget: boolean;
};

export const DropZoneEditPure = (props: DropZoneProps) => (
  <DropZoneEdit {...props} />
);

const DropZoneChild = ({
  zoneCompound,
  componentId,
  preview,
  index,
  isEnabled,
  dragAxis,
  collisionAxis,
  inDroppableZone,
}: {
  zoneCompound: string;
  componentId: string;
  preview?: Preview;
  index: number;
  isEnabled: boolean;
  dragAxis: DragAxis;
  collisionAxis?: DragAxis;
  inDroppableZone: boolean;
}) => {
  const metadata = useAppStore((s) => s.metadata);

  const ctx = useContext(dropZoneContext);
  const { depth = 1 } = ctx ?? {};

  const nodeProps = useAppStore(
    useShallow((s) => {
      return s.state.indexes.nodes[componentId]?.flatData.props;
    })
  );

  const nodeType = useAppStore(
    (s) => s.state.indexes.nodes[componentId]?.data.type
  );

  const nodeReadOnly = useAppStore(
    useShallow((s) => s.state.indexes.nodes[componentId]?.data.readOnly)
  );

  const node = { type: nodeType, props: nodeProps };

  const item = nodeProps
    ? node
    : preview?.componentType
    ? { type: preview.componentType, props: preview.props }
    : null;

  const componentConfig = useAppStore((s) =>
    item?.type ? s.config.components[item.type] : null
  );

  const puckProps: PuckContext = {
    renderDropZone: DropZoneEditPure,
    isEditing: true,
    dragRef: null,
    metadata: { ...metadata, ...componentConfig?.metadata },
  };

  const overrides = useAppStore((s) => s.overrides);
  const isLoading = useAppStore(
    (s) => s.componentState[componentId]?.loadingCount > 0
  );
  const isSelected = useAppStore(
    (s) => s.selectedItem?.props.id === componentId || false
  );

  let label = componentConfig?.label ?? item?.type.toString() ?? "Component";

  const renderPreview = useMemo(
    () =>
      function Preview() {
        return (
          <DrawerItemInner name={label}>
            {overrides.componentItem}
          </DrawerItemInner>
        );
      },
    [componentId, label, overrides]
  );

  const defaultsProps = useMemo(
    () => ({
      ...componentConfig?.defaultProps,
      ...item?.props,
      puck: puckProps,
      editMode: true, // DEPRECATED
    }),
    [componentConfig?.defaultProps, item?.props, puckProps]
  );

  const defaultedPropsWithSlots = useSlots(
    componentConfig,
    defaultsProps,
    DropZoneEditPure,
    (slotProps) => (
      <ContextSlotRender componentId={componentId} zone={slotProps.zone} />
    ),
    nodeReadOnly,
    isLoading
  );

  if (!item) return;

  let Render = componentConfig
    ? componentConfig.render
    : () => (
        <div style={{ padding: 48, textAlign: "center" }}>
          No configuration for {item.type}
        </div>
      );

  let componentType = item.type as string;

  const isPreview =
    componentId === preview?.props.id && preview.type === "insert";

  if (isPreview) {
    Render = renderPreview;
  }

  return (
    <DraggableComponent
      id={componentId}
      componentType={componentType}
      zoneCompound={zoneCompound}
      depth={depth + 1}
      index={index}
      isLoading={isLoading}
      isSelected={isSelected}
      label={label}
      isEnabled={isEnabled}
      autoDragAxis={dragAxis}
      userDragAxis={collisionAxis}
      inDroppableZone={inDroppableZone}
    >
      {(dragRef) =>
        componentConfig?.inline && !isPreview ? (
          <>
            <Render
              {...defaultedPropsWithSlots}
              puck={{
                ...defaultedPropsWithSlots.puck,
                dragRef,
              }}
            />
          </>
        ) : (
          <div ref={dragRef}>
            <Render {...defaultedPropsWithSlots} />
          </div>
        )
      }
    </DraggableComponent>
  );
};

const DropZoneChildMemo = memo(DropZoneChild);

export const DropZoneEdit = forwardRef<HTMLDivElement, DropZoneProps>(
  function DropZoneEditInternal(
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
    const ctx = useContext(dropZoneContext);

    const {
      // These all need setting via context
      areaId,
      depth = 0,
      registerLocalZone,
      unregisterLocalZone,
    } = ctx ?? {};

    const path = useAppStore(
      useShallow((s) => (areaId ? s.state.indexes.nodes[areaId]?.path : null))
    );

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
    } = useContextStore(ZoneStoreContext, (s) => {
      return {
        isDeepestZone: s.zoneDepthIndex[zoneCompound] ?? false,
        inNextDeepestArea: s.nextAreaDepthIndex[areaId || ""],
        draggedComponentType: s.draggedItem?.data.componentType,
        userIsDragging: !!s.draggedItem,
      };
    });

    const zoneContentIds = useAppStore(
      useShallow((s) => {
        return s.state.indexes.zones[zoneCompound]?.contentIds;
      })
    );
    const zoneType = useAppStore(
      useShallow((s) => {
        return s.state.indexes.zones[zoneCompound]?.type;
      })
    );

    // Register and unregister zone on mount
    useEffect(() => {
      if (!zoneType || zoneType === "dropzone") {
        if (zoneCompound !== rootDroppableId) {
          console.warn(
            "DropZones have been deprecated in favor of slot fields and will be removed in a future version of Puck. Please see the migration guide: https://www.puckeditor.com/docs/guides/migrations/dropzones-to-slots"
          );
        }

        if (ctx?.registerZone) {
          ctx?.registerZone(zoneCompound);
        }

        return () => {
          if (ctx?.unregisterZone) {
            ctx?.unregisterZone(zoneCompound);
          }
        };
      }
    }, [zoneType]);

    const contentIds = useMemo(() => {
      return zoneContentIds || [];
    }, [zoneContentIds]);

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

    const [contentIdsWithPreview, preview] = useContentIdsWithPreview(
      contentIds,
      zoneCompound
    );

    const isDropEnabled =
      isEnabled &&
      (preview
        ? contentIdsWithPreview.length === 1
        : contentIdsWithPreview.length === 0);

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
        path: path || [],
      },
    };

    const { ref: dropRef } = useDroppableSafe(droppableConfig);

    const isAreaSelected = useAppStore(
      (s) => s?.selectedItem && areaId === s?.selectedItem.props.id
    );

    const [dragAxis] = useDragAxis(ref, collisionAxis);

    const [minEmptyHeight, isAnimating] = useMinEmptyHeight({
      zoneCompound,
      userMinEmptyHeight,
      ref,
    });

    return (
      <div
        className={`${getClassName({
          isRootZone,
          userIsDragging,
          hoveringOverArea,
          isEnabled,
          isAreaSelected,
          hasChildren: contentIds.length > 0,
          isAnimating,
        })}${className ? ` ${className}` : ""}`}
        ref={(node) => {
          assignRefs<HTMLDivElement>([ref, dropRef, userRef], node);
        }}
        data-testid={`dropzone:${zoneCompound}`}
        data-puck-dropzone={zoneCompound}
        style={
          {
            ...style,
            "--min-empty-height": `${minEmptyHeight}px`,
            backgroundColor: RENDER_DEBUG
              ? getRandomColor()
              : style?.backgroundColor,
          } as CSSProperties
        }
      >
        {contentIdsWithPreview.map((componentId, i) => {
          return (
            <DropZoneChildMemo
              key={componentId}
              zoneCompound={zoneCompound}
              componentId={componentId}
              preview={preview}
              dragAxis={dragAxis}
              isEnabled={isEnabled}
              index={i}
              collisionAxis={collisionAxis}
              inDroppableZone={acceptsTarget(draggedComponentType)}
            />
          );
        })}
      </div>
    );
  }
);

const DropZoneRenderItem = ({
  config,
  item,
  metadata,
}: {
  config: Config;
  item: ComponentData;
  metadata: Metadata;
}) => {
  const Component = config.components[item.type];

  const props = useSlots(Component, item.props, (slotProps) => (
    <SlotRenderPure {...slotProps} config={config} metadata={metadata} />
  ));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const nextContextValue = useMemo<DropZoneContext>(
    () => ({
      areaId: props.id,
      depth: 1,
    }),
    [props]
  );

  return (
    <DropZoneProvider key={props.id} value={nextContextValue}>
      <Component.render
        {...props}
        puck={{
          ...props.puck,
          renderDropZone: DropZoneRenderPure,
          metadata: { ...metadata, ...Component.metadata },
        }}
      />
    </DropZoneProvider>
  );
};

export const DropZoneRenderPure = (props: DropZoneProps) => (
  <DropZoneRender {...props} />
);

const DropZoneRender = forwardRef<HTMLDivElement, DropZoneProps>(
  function DropZoneRenderInternal({ className, style, zone }, ref) {
    const ctx = useContext(dropZoneContext);
    const { areaId = "root" } = ctx || {};
    const { config, data, metadata } = useContext(renderContext);

    let zoneCompound = rootDroppableId;
    let content = data?.content || [];

    // Register zones if running Render mode inside editor (i.e. previewMode === "interactive")
    useEffect(() => {
      // Only register zones, not slots
      if (!content) {
        if (ctx?.registerZone) {
          ctx?.registerZone(zoneCompound);
        }

        return () => {
          if (ctx?.unregisterZone) {
            ctx?.unregisterZone(zoneCompound);
          }
        };
      }
    }, [content]);

    if (!data || !config) {
      return null;
    }

    if (areaId !== rootAreaId && zone !== rootZone) {
      zoneCompound = `${areaId}:${zone}`;
      content = setupZone(data, zoneCompound).zones[zoneCompound];
    }

    return (
      <div className={className} style={style} ref={ref}>
        {content.map((item) => {
          const Component = config.components[item.type];
          if (Component) {
            return (
              <DropZoneRenderItem
                key={item.props.id}
                config={config}
                item={item}
                metadata={metadata}
              />
            );
          }

          return null;
        })}
      </div>
    );
  }
);

export const DropZonePure = (props: DropZoneProps) => <DropZone {...props} />;

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
