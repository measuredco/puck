import { curves, timings } from "./animation";
import { calculateDistance } from "./calculate-distance";
import { findNearestList } from "./find-nearest-list";

let looping = false;

type ElData = {
  el: Element;
  rect: DOMRect;
};

type Impact = ElData & {
  center: { x: number; y: number };
  position: "beforebegin" | "afterend";
};

function querySelectorAll<T extends Element = Element>(
  parentNode: ParentNode,
  selector: string
): T[] {
  return Array.from(parentNode.querySelectorAll<T>(selector));
}

/**
 * querySelectorAllIframe
 *
 * An proxy of querySelectorAll that also queries all iframes
 */
function querySelectorAllIframe(selector: string) {
  const iframes = (
    querySelectorAll(document, "iframe") as HTMLIFrameElement[]
  ).filter((iframe) => iframe.hasAttribute("data-rfd-iframe"));

  return [
    ...querySelectorAll(document, selector),
    ...iframes.reduce<Element[]>(
      (acc, iframe) => [
        ...acc,
        ...(iframe.contentWindow?.document
          ? querySelectorAll(iframe.contentWindow.document, selector)
          : []),
      ],
      []
    ),
  ];
}

const getAllDocs = () => [
  document,
  ...(querySelectorAll<HTMLIFrameElement>(document, "[data-gdnd-frame]")
    .map((iframe) => iframe.contentDocument)
    .filter(Boolean) as Document[]),
];

const monitorMousePosition = () => {
  global.mousePosition = { x: 0, y: 0 };

  const documents = getAllDocs();

  documents.forEach((doc) => {
    doc.onmousemove = (e) => {
      console.log("global mouse move", e);
      global.mousePosition.x = e.clientX;
      global.mousePosition.y = e.clientY;
    };
  });
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

  const drag: {
    item: {
      el: HTMLElement | null;
      rect: DOMRect | null;
    };
    list: {
      el: HTMLElement | null;
      rect: DOMRect | null;
    };
    origin: { x: number; y: number };
  } = {
    item: { el: null, rect: null },
    list: { el: null, rect: null },
    origin: { x: 0, y: 0 },
  };

  const placeholder: HTMLDivElement = document.createElement("div");

  monitorMousePosition();

  const lockAnimationAxis: "x" | "y" | null = null;
  type Direction = "up" | "down" | "steady";
  let lastImpact: Impact | null = null;
  let lastMousePositions: number[] = [];
  let lastDirection: Direction = "steady";

  // TODO call bind dynamically to catch new items, or expose "rebind" function
  const rebind = () => {
    if (state === "DROPPING") {
      return;
    }

    const draggables = querySelectorAllIframe("[data-gdnd-drag]");

    // console.log("draggables", draggables);

    for (let i = 0; i < draggables.length; i++) {
      const el = draggables[i] as HTMLElement;
      let rect: DOMRect;

      const dragStart = (event: MouseEvent) => {
        // Only continue if left button pressed
        if (event.button !== 0) {
          return;
        }

        // Clicked on currently dragged element
        if (drag.item.el === el) {
          dragEnd();
          return;
        }

        rect = el.getBoundingClientRect();
        drag.item.el = el;
        drag.item.rect = rect;
        drag.origin = structuredClone(global.mousePosition);

        drag.list.el = findNearestList(el);
        drag.list.rect = drag.list.el?.getBoundingClientRect() || null;

        // We perform drag end inside the window listener so we can capture mouseup outside of the window
        el.ownerDocument.defaultView?.addEventListener("mouseup", dragEnd);

        state = "START_DRAGGING";
      };

      const dragEnd = () => {
        el.ownerDocument.defaultView?.removeEventListener("mouseup", dragEnd);

        if (state !== "DRAGGING") {
          console.log("drag aborted");

          drag.item.el = null;
          placeholder?.remove();

          return;
        }

        console.log("drag end", placeholder);

        if (rect && placeholder && lastImpact) {
          const targetRect = placeholder!.getBoundingClientRect();

          const listOffset = {
            top: drag.list.rect?.top || 0,
            left: drag.list.rect?.left || 0,
          };

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
        drag.item.el = null;
        state = "IDLE";
      };

      el.onmousedown = dragStart;
    }
  };

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
    if (drag.item.rect) {
      const listOffset = {
        top: drag.list.rect?.top || 0,
        left: drag.list.rect?.left || 0,
      };

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
          ...drag.item.rect,
          bottom: drag.item.rect.bottom + deltaY,
          top: drag.item.rect.top + deltaY,
          left: drag.item.rect.left + deltaX,
          right: drag.item.rect.right + deltaX,
        },
      };
    }
  };

  const loop = () => {
    requestAnimationFrame(() => {
      const draggables = querySelectorAllIframe("[data-gdnd-drag]");

      const direction = getDirection();

      if (state === "IDLE") {
        // TODO replace with manual rebind() calls for performance
        rebind();
      } else if (state === "START_DRAGGING" && drag.item.el && drag.item.rect) {
        const distance = calculateDistance(drag.origin, global.mousePosition);

        if (distance >= DRAGGING_THRESHOLD) {
          state = "DRAGGING";
        }
      } else if (state === "DRAGGING" && drag.item.el && drag.item.rect) {
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

          if (el === drag.item.el) {
            continue;
          }

          // TODO mutate by transforms and iframes
          // getRelativeClientRect(drag.item.el, drag.list.el!);
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
            top: ${drag.item.rect.top}px;
            left: ${drag.item.rect.left}px;
            width: ${drag.item.rect.width}px;
            height: ${drag.item.rect.height}px;
            user-select; none;
          `;

        drag.item.el.setAttribute("style", transformStyle);

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
               top: ${drag.item.rect.top}px;
               left: ${drag.item.rect.left}px;
               width: ${axis === "x" ? `${drag.item.rect.width}px` : "100%"};
               height: ${axis === "y" ? `${drag.item.rect.height}px` : "100%"};`
          );

          const placeholderTarget = impact?.el || drag.item.el;
          placeholderTarget.insertAdjacentElement(
            impact?.position || "afterend",
            placeholder
          );

          //   impact?.el.setAttribute(
          //     "style",
          //     `
          //           transform: translateX(${0}px) translateY(${
          //       drag.item.rect.height
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
