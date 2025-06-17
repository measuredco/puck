import React from "react";
import { ResizeHandle } from "../ResizeHandle";
import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Sidebar", styles);
const getResizeHandleContainerClassName = getClassNameFactory(
  "ResizeHandleContainer",
  styles
);

interface SidebarProps {
  position: "left" | "right";
  sidebarRef: { current: HTMLDivElement | null };
  isVisible: boolean;
  width: number | null;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  position,
  sidebarRef,
  isVisible,
  width,
  onResize,
  onResizeEnd,
  children,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <div
        ref={sidebarRef}
        className={`${getClassName()} ${getClassName(`--${position}`)}`}
      >
        {children}
      </div>
      <div
        className={`${getResizeHandleContainerClassName()} ${getResizeHandleContainerClassName(
          `--${position}`
        )}`}
      >
        <ResizeHandle
          position={position}
          sidebarRef={sidebarRef}
          onResize={onResize}
          onResizeEnd={onResizeEnd}
        />
      </div>
    </>
  );
};
