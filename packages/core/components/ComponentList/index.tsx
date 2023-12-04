import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { ReactNode } from "react";
import { useAppContext } from "../Puck/context";
import { ChevronDown, ChevronUp } from "react-feather";
import { Drawer, DrawerItem } from "../Drawer";

const getClassName = getClassNameFactory("ComponentList", styles);

const ComponentListItem = ({
  name,
  id,
  index,
}: {
  name: string;
  id?: string;
  index: number;
}) => {
  const { customUi } = useAppContext();

  return (
    <DrawerItem name={name} id={id} index={index}>
      {customUi.componentDrawerItem}
    </DrawerItem>
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
        <Drawer droppableId={`component-list${title ? `:${title}` : ""}`}>
          {children ||
            Object.keys(config.components).map((componentKey, i) => {
              return (
                <DrawerItem key={componentKey} name={componentKey} index={i} />
              );
            })}
        </Drawer>
      </div>
    </div>
  );
};

ComponentList.Item = ComponentListItem;

export { ComponentList };
