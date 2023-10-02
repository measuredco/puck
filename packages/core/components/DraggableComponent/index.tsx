import {
  CSSProperties,
  MutableRefObject,
  ReactNode,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DragStart,
  DragUpdate,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DraggingStyle,
} from "react-beautiful-dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, Trash } from "react-feather";
import { useModifierHeld } from "../../lib/use-modifier-held";
import { dropZoneContext } from "../DropZone";
import { getItem } from "../../lib/get-item";
import { getZoneId } from "../../lib/get-zone-id";
import { DropZoneContext } from "../DropZone/context";

const getClassName = getClassNameFactory("DraggableComponent", styles);

function getAbsCoordinates(elem) {
  // crossbrowser version
  const box = elem.getBoundingClientRect();

  const body = document.body;
  const docEl = document.documentElement;

  const scrollTop = docEl.scrollTop || body.scrollTop;
  const scrollLeft = docEl.scrollLeft || body.scrollLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const clientLeft = docEl.clientLeft || body.clientLeft || 0;

  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
}

export const patchStyles = ({
  provided,
  snapshot,
  draggedEl,
  draggedItem,
  droppableSizes,
  placeholderStyle,
}: {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  draggedEl?: HTMLElement | null;
  draggedItem?: DragStart & Partial<DragUpdate>;
  droppableSizes?: Record<string, { width: number; height: number }>;
  placeholderStyle?: CSSProperties;
}) => {
  let additionalStyles: CSSProperties = {};

  let width: CSSProperties["width"];
  let widthDifference: number = 0;

  let originalWidth: number;

  if (draggedItem?.destination && droppableSizes) {
    originalWidth = droppableSizes[draggedItem?.source?.droppableId].width;

    width =
      droppableSizes[draggedItem?.destination?.droppableId].width ||
      originalWidth;

    widthDifference = originalWidth - width;
  }

  const destination = draggedItem?.destination;

  const [sourceArea] = getZoneId(draggedItem?.source.droppableId);
  const [destinationArea] = getZoneId(draggedItem?.destination?.droppableId);

  // We use custom animations when changing area
  const changedArea = sourceArea !== destinationArea;

  if (destination) {
    const droppableEl = document.querySelector(
      `[data-rbd-droppable-id="${destination.droppableId}"]`
    ) as HTMLElement | null;

    if (
      snapshot.isDropAnimating &&
      snapshot.dropAnimation &&
      typeof width === "number"
    ) {
      const { moveTo } = snapshot.dropAnimation;

      if (width) additionalStyles.width = width;

      if (changedArea) {
        if (draggedEl) {
          let transform = draggedEl.style.transform;

          if (transform) {
            const matches =
              /translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/.exec(transform);
            const existingTransformY = matches ? parseFloat(matches[2]) : 0;

            if (draggedEl && droppableEl && placeholderStyle) {
              const placeholderTop = parseInt(placeholderStyle.top!.toString());

              const transformY = -(
                draggedEl?.getBoundingClientRect().y -
                (placeholderTop + getAbsCoordinates(droppableEl).top)
              );

              additionalStyles.transform = `translate(${moveTo.x}px, ${
                transformY + existingTransformY
              }px)`;
            }
          }
        }
      }
    } else if (snapshot.isDragging) {
      let transform = provided.draggableProps.style?.transform;

      if (transform) {
        const matches = /translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/.exec(
          transform
        );
        const x = matches ? parseFloat(matches[1]) : 0;
        const y = matches ? parseFloat(matches[2]) : 0;

        const updatedX = x + widthDifference / 2;

        const updatedY = changedArea ? y : y;

        // console.log(getAbsCoordinates(draggedEl).top);
        // console.log(x, y);
        // console.log(draggedEl?.getBoundingClientRect());

        transform = `translate(${updatedX}px, ${updatedY}px)`;
      }
      if (width) {
        additionalStyles.width = width;
      }
      additionalStyles.transform = transform;
    }

    return additionalStyles;
  }
};

export const DraggableComponent = ({
  children,
  id,
  index,
  isSelected = false,
  onClick = () => null,
  onMount = () => null,
  onMouseOver = () => null,
  onMouseOut = () => null,
  onDelete = () => null,
  onDuplicate = () => null,
  debug,
  label,
  isLocked = false,
  isDragDisabled,
  forceHover = false,
  indicativeHover = false,
  style,
}: {
  children: ReactNode;
  id: string;
  index: number;
  isSelected?: boolean;
  onClick?: (e: SyntheticEvent) => void;
  onMount?: () => void;
  onMouseOver?: (e: SyntheticEvent) => void;
  onMouseOut?: (e: SyntheticEvent) => void;
  onDelete?: (e: SyntheticEvent) => void;
  onDuplicate?: (e: SyntheticEvent) => void;
  debug?: string;
  label?: string;
  isLocked: boolean;
  isDragDisabled?: boolean;
  forceHover?: boolean;
  indicativeHover?: boolean;
  style?: CSSProperties;
}) => {
  const isModifierHeld = useModifierHeld("Alt");

  useEffect(() => {
    if (onMount) onMount();
  }, []);

  const { draggedItem, droppableSizes, data, placeholderStyle } =
    useContext(dropZoneContext) || {};

  const ref = useRef(null) as MutableRefObject<HTMLElement | null>;

  return (
    <Draggable
      key={id}
      draggableId={id}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided, snapshot) => {
        const draggedEl = ref.current;

        const additionalStyles = patchStyles({
          provided,
          snapshot,
          draggedEl,
          draggedItem,
          droppableSizes,
          placeholderStyle,
        });

        return (
          <div
            ref={(node) => {
              ref.current = node;
              provided.innerRef(node);
            }}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            id={`draggable-component-${id}`}
            className={getClassName({
              isSelected,
              isModifierHeld,
              isDragging: snapshot.isDragging,
              isLocked,
              forceHover,
              indicativeHover,
            })}
            style={{
              ...style,
              ...provided.draggableProps.style,
              ...additionalStyles,
              cursor: isModifierHeld ? "initial" : "grab",
              marginLeft: "auto",
              marginRight: "auto", // Adjust the transform property if dragging
              // transform,
            }}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
          >
            {debug}
            <div className={getClassName("contents")}>{children}</div>

            <div className={getClassName("overlay")}>
              <div className={getClassName("actions")}>
                {label && (
                  <div className={getClassName("actionsLabel")}>{label}</div>
                )}
                <button
                  className={getClassName("action")}
                  onClick={onDuplicate}
                >
                  <Copy size={16} />
                </button>
                <button className={getClassName("action")} onClick={onDelete}>
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
};
