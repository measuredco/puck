import DroppableStrictMode from "../DroppableStrictMode";
import { Config } from "../../types/Config";

import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Draggable } from "../Draggable";
import { DragIcon } from "../DragIcon";

const getClassName = getClassNameFactory("ComponentList", styles);

export const ComponentList = ({ config }: { config: Config }) => {
  return (
    <DroppableStrictMode droppableId="component-list" isDropDisabled>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={getClassName({
            isDraggingFrom: !!snapshot.draggingFromThisWith,
          })}
        >
          {Object.keys(config.components).map((componentKey, i) => {
            return (
              <Draggable
                key={componentKey}
                id={componentKey}
                index={i}
                showShadow
                disableAnimations
                className={() => getClassName("item")}
              >
                {() => (
                  <>
                    {componentKey}
                    <div className={getClassName("itemIcon")}>
                      <DragIcon />
                    </div>
                  </>
                )}
              </Draggable>
            );
          })}
          {/* Use different element so we don't clash with :last-of-type */}
          <span style={{ display: "none" }}>{provided.placeholder}</span>
        </div>
      )}
    </DroppableStrictMode>
  );
};
