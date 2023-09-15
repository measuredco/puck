import DroppableStrictMode from "../DroppableStrictMode";
import { ComponentConfig, Config } from "../../types/Config";
import { Draggable } from "react-beautiful-dnd";

import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Grid } from "react-feather";

const getClassName = getClassNameFactory("ComponentList", styles);

export const ComponentList = ({ config }: { config: Config }) => {
  return (
    <DroppableStrictMode droppableId="component-list" isDropDisabled>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={getClassName()}
        >
          {Object.keys(config.components).map((componentKey, i) => {
            const componentConfig: ComponentConfig = config[componentKey];

            return (
              <Draggable
                key={componentKey}
                draggableId={componentKey}
                index={i}
              >
                {(provided, snapshot) => (
                  <>
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={getClassName("item")}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging
                          ? provided.draggableProps.style?.transform
                          : "translate(0px, 0px)",
                      }}
                    >
                      {componentKey}
                      <div className={getClassName("itemIcon")}>
                        <Grid size={18} />
                      </div>
                    </div>
                    {/* See https://github.com/atlassian/react-beautiful-dnd/issues/216#issuecomment-906890987 */}
                    {snapshot.isDragging && (
                      <div
                        className={getClassName("itemShadow")}
                        style={{ transform: "none !important" }}
                      >
                        {componentKey}
                        <div className={getClassName("itemIcon")}>
                          <Grid size={18} />
                        </div>
                      </div>
                    )}
                  </>
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
