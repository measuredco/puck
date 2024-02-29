import { CSSProperties, ReactNode, SyntheticEvent, useEffect } from "react";
import { Draggable } from "@measured/dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, Trash } from "lucide-react";
import { useModifierHeld } from "../../lib/use-modifier-held";
import { ClipLoader } from "react-spinners";
import { useAppContext } from "../Puck/context";

const getClassName = getClassNameFactory("DraggableComponent", styles);

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
  const { state } = useAppContext();
  const isModifierHeld = useModifierHeld("Alt");

  useEffect(onMount, []);

  return (
    <Draggable
      key={id}
      draggableId={id}
      index={index}
      isDragDisabled={isDragDisabled}
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
            className={getClassName("overlay")}
            style={{ zoom: 1 / state.ui.viewports.current.zoom }}
          >
            <div className={getClassName("actions")}>
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
          <div className={getClassName("contents")}>{children}</div>
        </div>
      )}
    </Draggable>
  );
};
