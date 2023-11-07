import { Droppable } from "@hello-pangea/dnd";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Draggable } from "../Draggable";
import { DragIcon } from "../DragIcon";
import { ReactNode } from "react";
import { useAppContext } from "../Puck/context";
import { ChevronDown, ChevronUp } from "react-feather";

const getClassName = getClassNameFactory("ComponentList", styles);
const getClassNameItem = getClassNameFactory("ComponentListItem", styles);

const ComponentListItem = ({
  component,
  index,
  id,
}: {
  component: string;
  index: number;
  id: string;
}) => {
  return (
    <div className={getClassNameItem()}>
      <Draggable
        key={component}
        id={id}
        index={index}
        showShadow
        disableAnimations
        className={() => getClassNameItem("draggable")}
      >
        {() => (
          <>
            {component}
            <div className={getClassNameItem("icon")}>
              <DragIcon />
            </div>
          </>
        )}
      </Draggable>
    </div>
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
        <Droppable
          droppableId={`component-list${title ? `:${title}` : ""}`}
          isDropDisabled
        >
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={getClassName({
                isDraggingFrom: !!snapshot.draggingFromThisWith,
              })}
            >
              {children ||
                Object.keys(config.components).map((componentKey, i) => {
                  return (
                    <ComponentListItem
                      key={componentKey}
                      component={componentKey}
                      index={i}
                      id={componentKey}
                    />
                  );
                })}
              {/* Use different element so we don't clash with :last-of-type */}
              <span style={{ display: "none" }}>{provided.placeholder}</span>
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

ComponentList.Item = ComponentListItem;

export { ComponentList };
