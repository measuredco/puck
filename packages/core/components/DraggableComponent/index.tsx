import {
  CSSProperties,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { Draggable } from "@measured/dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, Trash } from "lucide-react";
import { useModifierHeld } from "../../lib/use-modifier-held";
import { isIos } from "../../lib/is-ios";
import { ClipLoader } from "react-spinners";
import { useAppContext } from "../Puck/context";
import { DefaultDraggable } from "../Draggable";

const getClassName = getClassNameFactory("DraggableComponent", styles);

// Magic numbers are used to position actions overlay 8px from top of component, bottom of component (when sticky scrolling) and side of preview
const space = 8;
const actionsOverlayTop = space * 6.5;
const actionsTop = -(actionsOverlayTop - 8);
const actionsRight = space;

export const DraggableComponent = ({
  children,
  id,
  index,
  isLoading = false,
  isSelected = false,
  onClick = () => null,
  onMount = () => null,
  onMouseDown = () => null,
  onMouseUp = () => null,
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
  onMouseDown?: (e: SyntheticEvent) => void;
  onMouseUp?: (e: SyntheticEvent) => void;
  onMouseOver?: (e: SyntheticEvent) => void;
  onMouseOut?: (e: SyntheticEvent) => void;
  onDelete?: (e: SyntheticEvent) => void;
  onDuplicate?: (e: SyntheticEvent) => void;
  debug?: string;
  label?: string;
  isLocked: boolean;
  isLoading: boolean;
  isDragDisabled?: boolean;
  forceHover?: boolean;
  indicativeHover?: boolean;
  style?: CSSProperties;
}) => {
  const { zoomConfig } = useAppContext();
  const isModifierHeld = useModifierHeld("Alt");

  const { status } = useAppContext();

  const El = status !== "LOADING" ? Draggable : DefaultDraggable;

  useEffect(onMount, []);

  const [disableSecondaryAnimation, setDisableSecondaryAnimation] =
    useState(false);

  useEffect(() => {
    // Disable animations on iOS to prevent GPU memory crashes
    if (isIos()) {
      setDisableSecondaryAnimation(true);
    }
  }, []);

  return (
    <El
      key={id}
      draggableId={id}
      index={index}
      isDragDisabled={isDragDisabled}
      disableSecondaryAnimation={disableSecondaryAnimation}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
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
            cursor: isModifierHeld ? "initial" : "grab",
          }}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onClick={onClick}
        >
          {debug}
          {isLoading && (
            <div className={getClassName("loadingOverlay")}>
              <ClipLoader aria-label="loading" size={16} color="inherit" />
            </div>
          )}

          <div
            className={getClassName("actionsOverlay")}
            style={{
              top: actionsOverlayTop / zoomConfig.zoom,
            }}
          >
            <div
              className={getClassName("actions")}
              style={{
                transform: `scale(${1 / zoomConfig.zoom}`,
                top: actionsTop / zoomConfig.zoom,
                right: actionsRight / zoomConfig.zoom,
              }}
            >
              {label && (
                <div className={getClassName("actionsLabel")}>{label}</div>
              )}
              <button className={getClassName("action")} onClick={onDuplicate}>
                <Copy size={16} />
              </button>
              <button className={getClassName("action")} onClick={onDelete}>
                <Trash size={16} />
              </button>
            </div>
          </div>
          <div className={getClassName("overlay")} />
          <div className={getClassName("contents")}>{children}</div>
        </div>
      )}
    </El>
  );
};
