import { Droppable } from "../Droppable";
import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { Draggable } from "../Draggable";
import { DragIcon } from "../DragIcon";
import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";

const getClassName = getClassNameFactory("Drawer", styles);
const getClassNameItem = getClassNameFactory("DrawerItem", styles);

const drawerContext = createContext<{ droppableId: string }>({
  droppableId: "",
});

const DrawerDraggable = ({
  children,
  id,
  index,
  isDragDisabled,
}: {
  children: ReactNode;
  id: string;
  index: number;
  isDragDisabled?: boolean;
}) => {
  return (
    <Draggable
      key={id}
      id={id}
      index={index}
      isDragDisabled={isDragDisabled}
      showShadow
      disableAnimations
      className={() => getClassNameItem({ disabled: isDragDisabled })}
    >
      {() => children}
    </Draggable>
  );
};

const DrawerItem = ({
  name,
  children,
  id,
  label,
  index,
  isDragDisabled,
}: {
  name: string;
  children?: (props: { children: ReactNode; name: string }) => ReactElement;
  id?: string;
  label?: string;
  index: number;
  isDragDisabled?: boolean;
}) => {
  const ctx = useContext(drawerContext);

  const resolvedId = `${ctx.droppableId}::${id || name}`;

  const CustomInner = useMemo(
    () =>
      children ||
      (({ children, name }: { children: ReactNode; name: string }) => (
        <div className={getClassNameItem("default")}>{children}</div>
      )),
    [children]
  );

  return (
    <DrawerDraggable
      id={resolvedId}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      <CustomInner name={name}>
        <div className={getClassNameItem("draggableWrapper")}>
          <div className={getClassNameItem("draggable")}>
            <div className={getClassNameItem("name")}>{label ?? name}</div>
            <div className={getClassNameItem("icon")}>
              <DragIcon isDragDisabled={isDragDisabled} />
            </div>
          </div>
        </div>
      </CustomInner>
    </DrawerDraggable>
  );
};

export const Drawer = ({
  children,
  droppableId: _droppableId = "default",
  direction = "vertical",
}: {
  children: ReactNode;
  droppableId?: string;
  direction?: "vertical" | "horizontal";
}) => {
  const droppableId = `component-list:${_droppableId}`;

  return (
    <drawerContext.Provider value={{ droppableId }}>
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
    </drawerContext.Provider>
  );
};

Drawer.Item = DrawerItem;
