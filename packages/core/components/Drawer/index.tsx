import styles from "./styles.module.css";
import getClassNameFactory from "../../lib/get-class-name-factory";
import { DragIcon } from "../DragIcon";
import { ReactElement, ReactNode, Ref, useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/react";
import { generateId } from "../../lib/generate-id";
import { useDragListener } from "../DragDropContext";

const getClassName = getClassNameFactory("Drawer", styles);
const getClassNameItem = getClassNameFactory("DrawerItem", styles);

export const DrawerItemInner = ({
  children,
  name,
  label,
  dragRef,
  isDragDisabled,
}: {
  children?: (props: { children: ReactNode; name: string }) => ReactElement;
  name: string;
  label?: string;
  dragRef?: Ref<any>;
  isDragDisabled?: boolean;
}) => {
  const CustomInner = useMemo(
    () =>
      children ||
      (({ children }: { children: ReactNode; name: string }) => (
        <div className={getClassNameItem("default")}>{children}</div>
      )),
    [children]
  );

  return (
    <div
      className={getClassNameItem({ disabled: isDragDisabled })}
      ref={dragRef}
      onMouseDown={(e) => e.preventDefault()}
    >
      <CustomInner name={name}>
        <div className={getClassNameItem("draggableWrapper")}>
          <div className={getClassNameItem("draggable")}>
            <div className={getClassNameItem("name")}>{label ?? name}</div>
            <div className={getClassNameItem("icon")}>
              <DragIcon />
            </div>
          </div>
        </div>
      </CustomInner>
    </div>
  );
};

/**
 * Wrap `useDraggable`, remounting it when the `id` changes.
 *
 * Could be removed by remounting `useDraggable` upstream in dndkit on `id` changes.
 */
const DrawerItemDraggable = ({
  children,
  name,
  label,
  id,
  isDragDisabled,
}: {
  children?: (props: { children: ReactNode; name: string }) => ReactElement;
  name: string;
  label?: string;
  id: string;
  isDragDisabled?: boolean;
}) => {
  const { ref } = useDraggable({
    id,
    data: { type: "drawer", componentType: name },
    disabled: isDragDisabled,
  });

  return (
    <DrawerItemInner
      name={name}
      label={label}
      dragRef={ref}
      isDragDisabled={isDragDisabled}
    >
      {children}
    </DrawerItemInner>
  );
};

const DrawerItem = ({
  name,
  children,
  id,
  label,
  isDragDisabled,
}: {
  name: string;
  children?: (props: { children: ReactNode; name: string }) => ReactElement;
  id?: string;
  label?: string;
  index?: number; // TODO deprecate
  isDragDisabled?: boolean;
}) => {
  const resolvedId = id || name;
  const [dynamicId, setDynamicId] = useState(generateId(resolvedId));

  useDragListener(
    "dragend",
    () => {
      setDynamicId(generateId(resolvedId));
    },
    [resolvedId]
  );

  return (
    <div key={dynamicId}>
      <DrawerItemDraggable
        name={name}
        label={label}
        id={dynamicId}
        isDragDisabled={isDragDisabled}
      >
        {children}
      </DrawerItemDraggable>
    </div>
  );
};

export const Drawer = ({
  children,
}: {
  children: ReactNode;
  droppableId?: string; // TODO deprecate
  direction?: "vertical" | "horizontal"; // TODO deprecate
}) => {
  return <div className={getClassName()}>{children}</div>;
};

Drawer.Item = DrawerItem;
