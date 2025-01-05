import {
  CSSProperties,
  forwardRef,
  ReactNode,
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
import { defaultContext, useAppContext } from "../Puck/context";
import { SlotProps } from "./types";
import {
  ComponentConfig,
  ComponentData,
  ComponentProps,
  Config,
  Content,
  DragAxis,
  PuckContext,
} from "../../types";

import { UseDroppableInput } from "@dnd-kit/react";
import { DrawerItemInner } from "../Drawer";
import { pointerIntersection } from "@dnd-kit/collision";
import { insert } from "../../lib/insert";
import { Draggable, UniqueIdentifier } from "@dnd-kit/abstract";
import { useDroppableSafe } from "../../lib/dnd/dnd-kit/safe";
import { useMinEmptyHeight } from "../../lib/use-min-empty-height";
import { assignRefs } from "../../lib/assign-refs";
import { DropZone } from "../DropZone";
import { Button } from "../Button";
import { SlotChild } from "../SlotChild";

const getClassName = getClassNameFactory("Slot", styles);

const DEBUG = false;

const GRID_DRAG_AXIS: DragAxis = "dynamic";
const FLEX_ROW_DRAG_AXIS: DragAxis = "x";
const DEFAULT_DRAG_AXIS: DragAxis = "y";

export type SlotDndData = {
  areaId?: string;
  depth: number;
  path: UniqueIdentifier[];
  isDroppableTarget: boolean;
};

// const SlotEdit = forwardRef<HTMLDivElement, SlotProps>(function SlotEdit(
//   {
//     name,
//     areaId,
//     content,
//     isEnabled = true,
//     allow,
//     disallow,
//     style,
//     className,
//     minEmptyHeight: userMinEmptyHeight = 128,
//     collisionAxis,
//   },
//   userRef
// ) {

const withSlots = (
  props: ComponentProps,
  renderSlot: ({
    name,
    content,
  }: {
    name: string;
    content: Content;
    config: Config;
  }) => ReactNode,
  config: Config
) => {
  return Object.keys(props).reduce<ComponentProps>((acc, propName) => {
    const value = props[propName];

    if (Array.isArray(value)) {
      const firstItem = value[0];

      // If type and props keys exist, assume this is a slot and try to render
      // This is preferable to checking for present of `slot` field, since user
      // may choose not to pass fields to Render component for perf reasons
      if (firstItem?.type && firstItem?.props) {
        return {
          ...acc,
          [propName]: renderSlot({
            name: propName,
            content: props[propName],
            config,
          }),
        };
      }
    }

    return { ...acc, [propName]: props[propName] };
  }, props);
};

const SlotEdit = function ({
  name,
  areaId,
  content,
  isEnabled = true,
  allow,
  disallow,
  style,
  className,
  minEmptyHeight: userMinEmptyHeight = 128,
  collisionAxis,
}: // path,
SlotProps) {
  const { config, state, status } = useAppContext();

  // const { data } = state;

  // const {
  //   // These all need setting via context
  //   areaId,
  //   draggedItem,
  //   registerZoneArea,
  //   depth,
  //   registerLocalZone,
  //   unregisterLocalZone,
  //   deepestZone = rootDroppableId,
  //   deepestArea,
  //   nextDeepestArea,
  //   path = [],
  //   activeZones,
  // } = ctx!;

  const { itemSelector } = state.ui;

  let zoneCompound = rootDroppableId;

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

  // const areaId = path[path.length - 2] as string;
  // const name = path[path.length - 1] as string;

  const isRootZone =
    zoneCompound === rootDroppableId ||
    name === rootDroppableId ||
    areaId === "root";

  const hoveringOverArea = false;
  // const hoveringOverArea = nextDeepestArea
  //   ? nextDeepestArea === areaId
  //   : isRootZone;

  const userIsDragging = false;

  // if (isEnabled) {
  //   isEnabled = acceptsTarget(draggedItem);
  // }

  // const preview = useContext(previewContext);

  // const previewInZone = preview?.zone === zoneCompound;

  // const contentWithPreview = useMemo(() => {
  //   let contentWithPreview = preview
  //     ? content.filter((item) => item.props.id !== preview.props.id)
  //     : content;

  //   if (previewInZone) {
  //     contentWithPreview = content.filter(
  //       (item) => item.props.id !== preview.props.id
  //     );

  //     if (preview.type === "insert") {
  //       contentWithPreview = insert(contentWithPreview, preview.index, {
  //         type: "preview",
  //         props: { id: preview.props.id },
  //       });
  //     } else {
  //       contentWithPreview = insert(contentWithPreview, preview.index, {
  //         type: preview.componentType,
  //         props: preview.props,
  //       });
  //     }
  //   }

  //   return contentWithPreview;
  // }, [preview, content]);

  // const isDropEnabled =
  //   isEnabled &&
  //   (previewInZone
  //     ? contentWithPreview.length === 1
  //     : contentWithPreview.length === 0);

  const droppableConfig: UseDroppableInput<SlotDndData> = {
    id: zoneCompound,
    collisionPriority: 1,
    // collisionPriority: isEnabled ? depth : 0,
    disabled: isEnabled, //!isDropEnabled,
    collisionDetector: pointerIntersection,
    type: "dropzone",
    data: {
      areaId,
      depth: 0,
      isDroppableTarget: true,
      // isDroppableTarget: acceptsTarget(draggedItem),
      path: [],
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

  useEffect(calculateDragAxis, [status, collisionAxis]);

  useEffect(() => {
    const onViewportChange = () => {
      calculateDragAxis();
    };

    window.addEventListener("viewportchange", onViewportChange);

    return () => {
      window.removeEventListener("viewportchange", onViewportChange);
    };
  }, []);

  const [minEmptyHeight, isAnimating] = [userMinEmptyHeight, false];
  // const [minEmptyHeight, isAnimating] = useMinEmptyHeight({
  //   draggedItem,
  //   zoneCompound,
  //   userMinEmptyHeight,
  //   ref,
  // });

  return (
    <div
      className={`${getClassName({
        isRootZone,
        userIsDragging,
        hoveringOverArea,
        isEnabled,
        isAreaSelected,
        hasChildren: content.length > 0,
        // isActive: activeZones?.[zoneCompound],
        isActive: true,
        isAnimating,
      })}${className ? ` ${className}` : ""}`}
      ref={(node) => {
        assignRefs<HTMLDivElement>([ref, dropRef], node);
        // assignRefs<HTMLDivElement>([ref, dropRef, userRef], node);
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
      {/* {isRootZone && DEBUG && (
        <div data-puck-component>
          <p>{deepestZone || rootDroppableId}</p>
          <p>{deepestArea || "No area"}</p>
        </div>
      )} */}
      {content.map((item, i) => {
        const componentId = item.props.id;

        const puckProps: PuckContext = {
          renderDropZone: DropZone,
          isEditing: true,
          dragRef: null,
        };

        const defaultedProps: ComponentProps = {
          ...config.components[item.type]?.defaultProps,
          ...item.props,
          puck: puckProps,
          editMode: true, // DEPRECATED
        };

        const propsWithSlots = withSlots(defaultedProps, SlotEdit, config);

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

        // if (item.type === "preview") {
        //   componentType = preview!.componentType;

        //   label =
        //     config.components[componentType]?.label ?? preview!.componentType;

        //   function Preview() {
        //     return <DrawerItemInner name={label} />;
        //   }

        //   Render = Preview;
        // }

        return (
          <SlotChild
            key={componentId}
            id={componentId}
            componentType={componentType}
            zoneCompound={zoneCompound}
            depth={0}
            // depth={depth + 1}
            index={i}
            isLoading={false}
            // isLoading={appContext.componentState[componentId]?.loadingCount > 0}
            isSelected={isSelected}
            label={label}
            isEnabled={isEnabled}
            autoDragAxis={dragAxis}
            userDragAxis={collisionAxis}
            inDroppableZone={true}
            // path={pathForComponent}
            // inDroppableZone={acceptsTarget(draggedItem)}
          >
            {(dragRef) =>
              componentConfig?.inline ? (
                <Render
                  {...propsWithSlots}
                  puck={{
                    ...propsWithSlots.puck,
                    dragRef,
                  }}
                />
              ) : (
                <div ref={dragRef}>
                  <Render {...propsWithSlots} />
                </div>
              )
            }
          </SlotChild>
        );
      })}
    </div>
  );
};

function SlotRender({ className, style, content, config }: SlotProps) {
  // const SlotRender = forwardRef<HTMLDivElement, SlotProps>(function SlotRender(
  //   { className, style, content },
  //   ref
  // ) {
  return (
    // ref={ref}
    <div className={className} style={style}>
      {content.map((item) => {
        const Component = config.components[item.type];

        const propsWithSlots = withSlots(item.props, SlotRender, config);

        console.log(propsWithSlots);

        if (Component) {
          return (
            <Component.render
              {...propsWithSlots}
              puck={{ renderSlot: SlotRender }}
              key={item.props.id}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

export const Slot = forwardRef<HTMLDivElement, SlotProps>(function Slot(
  props: SlotProps,
  ref
) {
  const ctx = useAppContext();

  if (ctx.dispatch !== defaultContext.dispatch) {
    return (
      <>
        <SlotEdit {...props} />
        {/* <SlotEdit {...props} ref={ref} /> */}
      </>
    );
  }

  return (
    <>
      <SlotRender {...props} />
      {/* <SlotRender {...props} ref={ref} /> */}
    </>
  );
});
