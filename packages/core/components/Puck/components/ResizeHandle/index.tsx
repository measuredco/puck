import React, { useCallback, useEffect, useRef } from "react";
import getClassNameFactory from "../../../../lib/get-class-name-factory";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("ResizeHandle", styles);

interface ResizeHandleProps {
  position: "left" | "right";
  sidebarRef: { current: HTMLDivElement | null };
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  sidebarRef,
  onResize,
  onResizeEnd,
}) => {
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;

      startWidth.current =
        sidebarRef.current?.getBoundingClientRect().width || 0;

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const overlay = document.createElement("div");
      overlay.id = "resize-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.right = "0";
      overlay.style.bottom = "0";
      overlay.style.zIndex = "9999";
      overlay.style.cursor = "col-resize";
      document.body.appendChild(overlay);

      e.preventDefault();
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const delta = e.clientX - startX.current;
      const newWidth =
        position === "left"
          ? startWidth.current + delta
          : startWidth.current - delta;

      const width = Math.max(186, newWidth);
      onResize(width);
      e.preventDefault();
    },
    [onResize, position]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    const overlay = document.getElementById("resize-overlay");
    if (overlay) {
      document.body.removeChild(overlay);
    }

    const finalWidth = sidebarRef.current?.getBoundingClientRect().width || 0;
    onResizeEnd(finalWidth);

    // Trigger auto zoom by dispatching the viewportchange event
    window.dispatchEvent(
      new CustomEvent("viewportchange", {
        bubbles: true,
        cancelable: false,
      })
    );
  }, [onResizeEnd]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={handleRef}
      className={`${getClassName()} ${getClassName(`--${position}`)}`}
      onMouseDown={handleMouseDown}
    />
  );
};
