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
  ZoneStoreContext,
  dropZoneContext,
} from "./context";
import { useAppStore, useAppStoreApi } from "../../store";
import { DropZoneProps } from "./types";
import {
  ComponentData,
  Config,
  DragAxis,
  Metadata,
  PuckContext,
} from "../../types";

import { useDroppable, UseDroppableInput } from "@dnd-kit/react";
import { DrawerItemInner } from "../Drawer";
import { pointerIntersection } from "@dnd-kit/collision";
import { UniqueIdentifier } from "@dnd-kit/abstract";
import { useMinEmptyHeight } from "./lib/use-min-empty-height";
import { assignRefs } from "../../lib/assign-refs";
import { useContentIdsWithPreview } from "./lib/use-content-with-preview";
import { useDragAxis } from "./lib/use-drag-axis";
import { useContextStore } from "../../lib/use-context-store";
import { useShallow } from "zustand/react/shallow";
import { renderContext } from "../Render";
import { useSlots } from "../../lib/use-slots";
import { ContextSlotRender, SlotRenderPure } from "../SlotRender";
import { expandNode } from "../../lib/data/flatten-node";

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
  index,
  dragAxis,
  collisionAxis,
  inDroppableZone,
}: {
  zoneCompound: string;
  componentId: string;
  index: number;
  dragAxis: DragAxis;
  collisionAxis?: DragAxis;
  inDroppableZone: boolean;
}) => {
  const metadata = useAppStore((s) => s.metadata);

  const ctx = useContext(dropZoneContext);
  const { depth = 1 } = ctx ?? {};

  const zoneStore = useContext(ZoneStoreContext);

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

  const appStore = useAppStoreApi();

  const item = useMemo(() => {
    if (nodeProps) {
      const expanded = expandNode({
        type: nodeType,
        props: nodeProps,
      }) as ComponentData;

      return expanded;
    }

    const preview = zoneStore.getState().previewIndex[zoneCompound];

    if (componentId === preview?.props.id) {
      return {
        type: preview.componentType,
        props: preview.props,
        previewType: preview.type,
      };
    }

    return null;
  }, [appStore, componentId, zoneCompound, nodeType, nodeProps]);

  const componentConfig = useAppStore((s) =>
    item?.type ? s.config.components[item.type] : null
  );

  const puckProps: PuckContext = useMemo(
    () => ({
      renderDropZone: DropZoneEditPure,
      isEditing: true,
      dragRef: null,
      metadata: { ...metadata, ...componentConfig?.metadata },
    }),
    [metadata, componentConfig?.metadata]
  );

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
    { type: nodeType, props: defaultsProps },
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

  const isInserting =
    "previewType" in item ? item.previewType === "insert" : false;

  if (isInserting) {
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
      autoDragAxis={dragAxis}
      userDragAxis={collisionAxis}
      inDroppableZone={inDroppableZone}
    >
      {(dragRef) =>
        componentConfig?.inline && !isInserting ? (
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

    const inNextDeepestArea = useContextStore(
      ZoneStoreContext,
      (s) => s.nextAreaDepthIndex[areaId || ""]
    );

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

    useEffect(() => {
      if (zoneType === "dropzone") {
        if (zoneCompound !== rootDroppableId) {
          console.warn(
            "DropZones have been deprecated in favor of slot fields and will be removed in a future version of Puck. Please see the migration guide: https://www.puckeditor.com/docs/guides/migrations/dropzones-to-slots"
          );
        }
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

    const targetAccepted = useContextStore(ZoneStoreContext, (s) => {
      const draggedComponentType = s.draggedItem?.data.componentType;
      return acceptsTarget(draggedComponentType);
    });

    const hoveringOverArea = inNextDeepestArea || isRootZone;

    const isEnabled = useContextStore(ZoneStoreContext, (s) => {
      let _isEnabled = true;
      const isDeepestZone = s.zoneDepthIndex[zoneCompound] ?? false;

      _isEnabled = isDeepestZone;

      if (_isEnabled) {
        _isEnabled = targetAccepted;
      }

      return _isEnabled;
    });

    useEffect(() => {
      if (registerLocalZone) {
        registerLocalZone(zoneCompound, isEnabled);
      }

      return () => {
        if (unregisterLocalZone) {
          unregisterLocalZone(zoneCompound);
        }
      };
    }, [isEnabled, zoneCompound]);

    const [contentIdsWithPreview, preview] = useContentIdsWithPreview(
      contentIds,
      zoneCompound
    );

    const isDropEnabled =
      isEnabled &&
      (preview
        ? contentIdsWithPreview.length === 1
        : contentIdsWithPreview.length === 0);

    const zoneStore = useContext(ZoneStoreContext);

    useEffect(() => {
      const { enabledIndex } = zoneStore.getState();
      zoneStore.setState({
        enabledIndex: { ...enabledIndex, [zoneCompound]: isEnabled },
      });
    }, [isEnabled, zoneStore, zoneCompound]);

    const droppableConfig: UseDroppableInput<DropZoneDndData> = {
      id: zoneCompound,
      collisionPriority: isEnabled ? depth : 0,
      disabled: !isDropEnabled,
      collisionDetector: pointerIntersection,
      type: "dropzone",
      data: {
        areaId,
        depth,
        isDroppableTarget: targetAccepted,
        path: path || [],
      },
    };

    const { ref: dropRef } = useDroppable(droppableConfig);

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
              dragAxis={dragAxis}
              index={i}
              collisionAxis={collisionAxis}
              inDroppableZone={targetAccepted}
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

  const props = useSlots(item.props, (slotProps) => (
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
