import { ReactNode, SyntheticEvent } from "react";
import { Draggable } from "react-beautiful-dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Copy, Trash } from "react-feather";
import { useModifierHeld } from "../../lib/use-modifier-held";

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
  const isModifierHeld = useModifierHeld("Alt");

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={getClassName({ isSelected, isModifierHeld })}
          style={{
            ...provided.draggableProps.style,
            cursor: isModifierHeld ? "initial" : "grab",
          }}
        >
          {debug}
          <div className={getClassName("contents")}>{children}</div>
          <div className={getClassName("overlay")} onClick={onClick}>
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
