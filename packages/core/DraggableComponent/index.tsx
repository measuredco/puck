import { ReactNode, SyntheticEvent } from "react";
import { Draggable } from "react-beautiful-dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../lib/get-class-name-factory";
import { Copy, Trash } from "react-feather";

const getClassName = getClassNameFactory("DraggableComponent", styles);

export const DraggableComponent = ({
  children,
  id,
  index,
  isSelected = false,
  onClick = () => null,
  onDelete = () => null,
  onDuplicate = () => null,
  debug,
  label,
}: {
  children: ReactNode;
  id: string;
  index: number;
  isSelected?: boolean;
  onClick?: (e: SyntheticEvent) => void;
  onDelete?: (e: SyntheticEvent) => void;
  onDuplicate?: (e: SyntheticEvent) => void;
  debug?: string;
  label?: string;
}) => {
  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={getClassName({ isSelected })}
          onClick={onClick}
        >
          {debug}
          {children}
          <div className={getClassName("overlay")}>
            <div className={getClassName("actions")}>
              {label && (
                <div className={getClassName("actionsLabel")}>{label}</div>
              )}
              <button className={getClassName("action")} onClick={onDuplicate}>
                <Copy />
              </button>
              <button className={getClassName("action")} onClick={onDelete}>
                <Trash />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
