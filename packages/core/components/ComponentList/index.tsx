import DroppableStrictMode from "../DroppableStrictMode";

import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Draggable } from "../Draggable";
import { DragIcon } from "../DragIcon";
import { ReactNode, useState } from "react";
import { useAppContext } from "../Puck/context";
import { ChevronDown, ChevronUp } from "react-feather";

const getClassName = getClassNameFactory("ComponentList", styles);
const getClassNameItem = getClassNameFactory("ComponentListItem", styles);

const ComponentListItem = ({
  component,
  index,
}: {
  component: string;
  index: number;
}) => {
  return (
    <div className={getClassNameItem()}>
      <Draggable
        key={component}
        id={component}
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
  defaultExpanded = true,
}: {
  children?: ReactNode;
  title?: string;
  defaultExpanded?: boolean;
}) => {
  const { config } = useAppContext();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={getClassName({ isExpanded })}>
      {title && (
        <div
          className={getClassName("title")}
          onClick={() => setIsExpanded(!isExpanded)}
          title={
            isExpanded
              ? `Collapse${title ? ` ${title}` : ""}`
              : `Expand${title ? ` ${title}` : ""}`
          }
        >
          <div>{title}</div>
          <div className={getClassName("titleIcon")}>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </div>
      )}
      <div className={getClassName("content")}>
        <DroppableStrictMode
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
                    />
                  );
                })}
              {/* Use different element so we don't clash with :last-of-type */}
              <span style={{ display: "none" }}>{provided.placeholder}</span>
            </div>
          )}
        </DroppableStrictMode>
      </div>
    </div>
  );
};

ComponentList.Item = ComponentListItem;

export { ComponentList };
