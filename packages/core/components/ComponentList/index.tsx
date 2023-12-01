import { Droppable } from "@hello-pangea/dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Draggable } from "../Draggable";
import { DragIcon } from "../DragIcon";
import { ReactNode, useMemo } from "react";
import { useAppContext } from "../Puck/context";
import { ChevronDown, ChevronUp } from "react-feather";

const getClassName = getClassNameFactory("ComponentList", styles);
const getClassNameItem = getClassNameFactory("ComponentListItem", styles);

export const ComponentListDraggable = ({
  children,
  id,
  index,
}: {
  children: ReactNode;
  id: string;
  index: number;
}) => (
  <Draggable key={id} id={id} index={index} showShadow disableAnimations>
    {() => children}
  </Draggable>
);

export const ComponentListItem = ({
  component,
  index,
}: {
  component: string;
  index: number;
}) => {
  const { customUi } = useAppContext();

  const CustomComponentListItem = useMemo(
    () => customUi.componentListItem || "div",
    [customUi]
  );

  return (
    <div className={getClassNameItem()}>
      <ComponentListDraggable id={component} index={index}>
        <CustomComponentListItem name={component}>
          <div className={getClassNameItem("draggableWrapper")}>
            <div className={getClassNameItem("draggable")}>
              <div className={getClassNameItem("name")}>{component}</div>
              <div className={getClassNameItem("icon")}>
                <DragIcon />
              </div>
            </div>
          </div>
        </CustomComponentListItem>
      </ComponentListDraggable>
    </div>
  );
};

export const ComponentListDroppable = ({
  children,
  droppableId = "component-list",
  direction = "vertical",
}: {
  children: ReactNode;
  droppableId?: string;
  direction?: "vertical" | "horizontal";
}) => {
  return (
    <Droppable droppableId={droppableId} isDropDisabled direction={direction}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={getClassName({
            isDraggingFrom: !!snapshot.draggingFromThisWith,
          })}
        >
          {children}

          {/* Use different element so we don't clash with :last-of-type */}
          <span style={{ display: "none" }}>{provided.placeholder}</span>
        </div>
      )}
    </Droppable>
  );
};

const ComponentList = ({
  children,
  title,
  id,
}: {
  id: string;
  children?: ReactNode;
  title?: string;
}) => {
  const { config, state, setUi } = useAppContext();

  const { expanded = true } = state.ui.componentList[id] || {};

  return (
    <div className={getClassName({ isExpanded: expanded })}>
      {title && (
        <div
          className={getClassName("title")}
          onClick={() =>
            setUi({
              componentList: {
                ...state.ui.componentList,
                [id]: {
                  ...state.ui.componentList[id],
                  expanded: !expanded,
                },
              },
            })
          }
          title={
            expanded
              ? `Collapse${title ? ` ${title}` : ""}`
              : `Expand${title ? ` ${title}` : ""}`
          }
        >
          <div>{title}</div>
          <div className={getClassName("titleIcon")}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </div>
      )}
      <div className={getClassName("content")}>
        <ComponentListDroppable
          droppableId={`component-list${title ? `:${title}` : ""}`}
        >
          {children ||
            Object.keys(config.components).map((componentKey, i) => {
              return (
                <ComponentListItem
                  key={componentKey}
                  component={componentKey}
                  index={i}
                />
              );
            })}
        </ComponentListDroppable>
      </div>
    </div>
  );
};

ComponentList.Item = ComponentListItem;

export { ComponentList };
