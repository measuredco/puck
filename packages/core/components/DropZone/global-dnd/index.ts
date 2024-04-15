import { curves, timings } from "./animation";
import { calculateDistance } from "./calculate-distance";

let looping = false;

type ElData = {
  el: Element;
  rect: DOMRect;
};

type Impact = ElData & {
  center: { x: number; y: number };
  position: "beforebegin" | "afterend";
};

// Testing custom dnd
const startGlobalDnd = (
  axis: "x" | "y" = "y",
  onDragEnd?: (params: {
    source: { index: number };
    destination: { index: number };
  }) => void
) => {
  let state: "IDLE" | "START_DRAGGING" | "DRAGGING" | "DROPPING" = "IDLE";

  global.mousePosition = { x: 0, y: 0 };

  const drag: {
    el: HTMLElement | null;
    rect: DOMRect | null;
    origin: { x: number; y: number };
  } = {
    el: null,
    rect: null,
    origin: { x: 0, y: 0 },
  };

  const placeholder: HTMLDivElement = document.createElement("div");

  document.onmousemove = (e) => {
    global.mousePosition.x = e.clientX;
    global.mousePosition.y = e.clientY;
  };

  const lockAnimationAxis: "x" | "y" | null = null;
  type Direction = "up" | "down" | "steady";
  let lastImpact: Impact | null = null;
  let lastMousePositions: number[] = [];
  let lastDirection: Direction = "steady";
  let globalDragEnd = () => {};

  // TODO call bind dynamically to catch new items, or expose "rebind" function
  const rebind = () => {
    if (state === "DROPPING") {
      return;
    }

    const draggables = Array.from(
      document.querySelectorAll("[data-drag-item]")
    );

    for (let i = 0; i < draggables.length; i++) {
      const el = draggables[i] as HTMLElement;
      let rect: DOMRect;

      const dragStart = (event: MouseEvent) => {
        // Only continue if left button pressed
        if (event.button !== 0) {
          return;
        }

        // Clicked on currently dragged element
        if (drag.el === el) {
          dragEnd();
          return;
        }

        rect = el.getBoundingClientRect();
        drag.el = el;
        drag.rect = rect;
        drag.origin = structuredClone(global.mousePosition);
        globalDragEnd = dragEnd;

        state = "START_DRAGGING";
      };

      const dragEnd = () => {
        if (state !== "DRAGGING") {
          console.log("drag aborted");

          drag.el = null;
          placeholder?.remove();

          return;
        }

        console.log("drag end", placeholder);

        if (rect && placeholder && lastImpact) {
          const targetRect = placeholder!.getBoundingClientRect();

          const deltaX = axis === "x" ? targetRect.left - rect.left : 0;
          const deltaY = axis === "y" ? targetRect.top - rect.top : 0;

          el?.setAttribute(
            "style",
            `
            transform: translateX(${deltaX}px) translateY(${deltaY}px);
            transition: transform ${timings.minDropTime}ms ${curves.drop};
            z-index: 1;
            position: fixed;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            user-select; none;
`
          );

          setTimeout(() => {
            placeholder?.remove();
            el.removeAttribute("style");
          }, timings.minDropTime);

          let targetIndex = draggables.indexOf(lastImpact.el);

          if (targetIndex >= i) {
            targetIndex = targetIndex - 1;
          }

          if (lastImpact.position === "afterend") {
            targetIndex = targetIndex + 1;
          }

          if (targetIndex !== i && onDragEnd) {
            setTimeout(() => {
              onDragEnd({
                source: {
                  index: i,
                },
                destination: {
                  index: targetIndex,
                },
              });
            }, timings.minDropTime - 10); // Run callback slightly before animation finished to prevent flicker.
          }
        }

        lastImpact = null;
        drag.el = null;
        state = "IDLE";
      };

      el.onmousedown = dragStart;
    }
  };

  // We perform drag end inside the window listener so we can capture mouseup outside of the window
  window.addEventListener("mouseup", () => {
    globalDragEnd();
  });

  const DIRECTION_SMOOTHING_WINDOW = 20;
  const DRAGGING_THRESHOLD = 5; // Must move this amount to start a drag

  const getDirection = () => {
    const trailingMousePosition =
      lastMousePositions.reduce<number>((acc, item) => acc + item, 0) /
      lastMousePositions.length;

    let direction: Direction = "steady";

    if (axis === "x") {
      if (global.mousePosition.x > trailingMousePosition) {
        direction = "up";
      } else if (global.mousePosition.x < trailingMousePosition) {
        direction = "down";
      }
    } else {
      if (global.mousePosition.y > trailingMousePosition) {
        direction = "up";
      } else if (global.mousePosition.y < trailingMousePosition) {
        direction = "down";
      }
    }

    lastMousePositions.unshift(
      axis === "x" ? global.mousePosition.x : global.mousePosition.y
    );

    lastMousePositions.splice(DIRECTION_SMOOTHING_WINDOW);

    if (direction === "steady") {
      return lastDirection;
    }

    lastDirection = direction;

    return direction;
  };

  const getTransformedRect = () => {
    if (drag.rect) {
      const deltaX =
        !lockAnimationAxis || lockAnimationAxis !== "x"
          ? global.mousePosition.x - drag.origin.x
          : 0;
      const deltaY =
        !lockAnimationAxis || lockAnimationAxis !== "y"
          ? global.mousePosition.y - drag.origin.y
          : 0;

      return {
        deltaX,
        deltaY,
        rect: {
          ...drag.rect,
          bottom: drag.rect.bottom + deltaY,
          top: drag.rect.top + deltaY,
          left: drag.rect.left + deltaX,
          right: drag.rect.right + deltaX,
        },
      };
    }
  };

  const paint = () => {};

  const loop = () => {
    requestAnimationFrame(() => {
      const draggables = document.querySelectorAll("[data-drag-item]");

      const direction = getDirection();

      if (state === "IDLE") {
        // TODO replace with manual rebind() calls for performance
        rebind();
      } else if (state === "START_DRAGGING" && drag.el && drag.rect) {
        const distance = calculateDistance(drag.origin, global.mousePosition);

        if (distance >= DRAGGING_THRESHOLD) {
          state = "DRAGGING";
        }
      } else if (state === "DRAGGING" && drag.el && drag.rect) {
        const {
          deltaX,
          deltaY,
          rect: transformedRect,
        } = getTransformedRect() || {};

        if (!transformedRect) {
          return loop();
        }

        const dimensions: ElData[] = [];

        // BUILD COLLISION INDEX
        for (let i = 0; i < draggables.length; i++) {
          const el = draggables[i];

          if (el === drag.el) {
            continue;
          }

          // TODO mutate by transforms and iframes
          let rect = el.getBoundingClientRect();

          const elData = {
            el,
            rect,
          };

          dimensions.push(elData);
        }

        const sortedByX = dimensions.sort((a, b) =>
          a.rect.left > b.rect.left ? 1 : -1
        );

        const sortedByY = dimensions.sort((a, b) =>
          a.rect.top > b.rect.top ? 1 : -1
        );

        const sorted = axis === "x" ? sortedByX : sortedByY;

        // FIND COLLISION
        let impact: Impact | null = null;

        let dragEdge = {
          x: transformedRect.left,
          y: transformedRect.top,
        };

        if (axis === "x") {
          if (direction === "down") {
            dragEdge.x = transformedRect.right; // moving left
          } else if (direction === "up") {
            dragEdge.x = transformedRect.left; // moving right
          }
        } else {
          if (direction === "down") {
            dragEdge.y = transformedRect.top; // moving up the axis
          } else if (direction === "up") {
            dragEdge.y = transformedRect.bottom; // moving down the axis
          }
        }

        for (let i = 0; i < sorted.length; i++) {
          const candidate = sorted[i];

          // TODO calculate ahead of time
          const candidateCenter = {
            x: candidate.rect.left + candidate.rect.width / 2,
            y: candidate.rect.top + candidate.rect.height / 2,
          };

          const distance = calculateDistance(candidateCenter, dragEdge);

          const existingDistance = impact
            ? calculateDistance(dragEdge, impact.center)
            : 0;

          let position = lastImpact?.position;

          if (axis === "x") {
            position =
              dragEdge.x > candidateCenter.x ? "afterend" : "beforebegin";
          } else {
            position =
              dragEdge.y > candidateCenter.y ? "afterend" : "beforebegin";
          }

          if (!impact || distance < existingDistance) {
            impact = {
              ...candidate,
              center: candidateCenter,
              position: position || "afterend",
            };
          }
        }

        // PAINT
        const transformStyle = `
            transform: translateX(${deltaX}px) translateY(${deltaY}px);
            z-index: 1;
            position: fixed;
            top: ${drag.rect.top}px;
            left: ${drag.rect.left}px;
            width: ${drag.rect.width}px;
            height: ${drag.rect.height}px;
            user-select; none;
          `;

        drag.el.setAttribute("style", transformStyle);

        if (
          //   true
          !impact ||
          impact.el !== lastImpact?.el ||
          impact.position !== lastImpact.position
        ) {
          if (placeholder) {
            placeholder.remove();
          }

          placeholder.setAttribute(
            "style",
            `
               background: hotpink;
               top: ${drag.rect.top}px;
               left: ${drag.rect.left}px;
               width: ${axis === "x" ? `${drag.rect.width}px` : "100%"};
               height: ${axis === "y" ? `${drag.rect.height}px` : "100%"};`
          );

          const placeholderTarget = impact?.el || drag.el;
          placeholderTarget.insertAdjacentElement(
            impact?.position || "afterend",
            placeholder
          );

          //   impact?.el.setAttribute(
          //     "style",
          //     `
          //           transform: translateX(${0}px) translateY(${
          //       drag.rect.height
          //     }px);
          //           transition: transform 200ms ease-in;
          //           `
          //   );

          //   if (impact?.el !== lastImpact?.el) {
          //     lastImpact?.el.setAttribute(
          //       "style",
          //       `
          //           transform: translateX(${0}px) translateY(${0}px);
          //           transition: transform 50ms ease-in;
          //           `
          //     );
          //   }

          lastImpact = impact;
        }
      }

      loop();
    });
  };

  if (typeof window !== "undefined" && !looping) {
    looping = true;

    loop();
  }
};

export default startGlobalDnd;
