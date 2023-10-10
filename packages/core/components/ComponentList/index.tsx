import DroppableStrictMode from "../DroppableStrictMode";
import { Config } from "../../types/Config";

import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Grid } from "react-feather";
import { Draggable } from "../Draggable";

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
              >
                {() => (
                  <div className={getClassName("item")}>
                    {componentKey}
                    <div className={getClassName("itemIcon")}>
                      <Grid size={18} />
                    </div>
                  </div>
                )}
              </Draggable>
            );
          })}
          <div style={{ display: "none" }}>{provided.placeholder}</div>
        </div>
      )}
    </DroppableStrictMode>
  );
};
