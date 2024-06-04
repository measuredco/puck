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
function getDraggables() {
  const draggables = querySelectorAllIframe("[data-gdnd-drag]");
  const draggablesByList = new Map<Element, Element[]>();

  draggables.forEach((candidate) => {
    const list = candidate.closest("[data-gdnd-drop]");

    if (!list) {
      console.warn(
        `Draggable item ${candidate} did not have a parent drop list.`
      );

      return;
    }

    const val = draggablesByList.get(list) || [];

    draggablesByList.set(list, [...val, candidate]);
  });

  return { draggables, draggablesByList };
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
      global.mousePosition.x = e.clientX;
      global.mousePosition.y = e.clientY;
    };
  });
};

// Testing custom dnd
const startGlobalDnd = (
  axis: "x" | "y" = "y",
  onDragEnd?: (params: {
    source: { index: number; list: string };
    destination: { index: number; list: string };
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

    // const draggables = querySelectorAllIframe("[data-gdnd-drag]");

    const { draggables } = getDraggables();

    for (let i = 0; i < draggables.length; i++) {
      const el = draggables[i] as HTMLElement;
      let rect: DOMRect;

      const dragStart = (event: MouseEvent) => {
        // Prevent nested draggables from triggering drag on parents
        event.stopPropagation();

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

        drag.list.el = el.closest("data-gdnd-drop");
        drag.list.rect = drag.list.el?.getBoundingClientRect() || null;

        // We perform drag end inside the window listener so we can capture mouseup outside of the window
        el.ownerDocument.defaultView?.addEventListener("mouseup", dragEnd);

        state = "START_DRAGGING";
      };

      const dragEnd = () => {
        el.ownerDocument.defaultView?.removeEventListener("mouseup", dragEnd);

        if (state !== "DRAGGING") {
          drag.item.el = null;
          placeholder?.remove();

          state = "IDLE";

          return;
        }

        if (rect && placeholder) {
          const targetRect = placeholder!.getBoundingClientRect();

          // const listOffset = {
          //   top: drag.list.rect?.top || 0,
          //   left: drag.list.rect?.left || 0,
          // };

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

          if (lastImpact) {
            const { draggablesByList } = getDraggables();

            const sourceList = el.closest("[data-gdnd-drop]");
            const targetList = lastImpact.el.closest("[data-gdnd-drop]");
            const sourceListId =
              sourceList?.getAttribute("data-gdnd-drop") || "";
            const targetListId =
              targetList?.getAttribute("data-gdnd-drop") || "";

            const draggablesForSourceList =
              (sourceList && draggablesByList.get(sourceList)) || [];
            const draggablesForTargetList =
              (targetList && draggablesByList.get(targetList)) || [];

            let sourceIndex = draggablesForSourceList.indexOf(el);

            console.log("draggablesForSourceList", draggablesForSourceList);

            let targetIndex = draggablesForTargetList.indexOf(lastImpact.el);

            if (targetIndex >= i) {
              targetIndex = targetIndex - 1;
            }

            if (lastImpact.position === "afterend") {
              targetIndex = targetIndex + 1;
            }

            if (onDragEnd) {
              setTimeout(() => {
                onDragEnd({
                  source: {
                    index: sourceIndex,
                    list: sourceListId,
                  },
                  destination: {
                    index: targetIndex,
                    list: targetListId,
                  },
                });
              }, timings.minDropTime - 10); // Run callback slightly before animation finished to prevent flicker.
            }
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
        const { draggables, draggablesByList } = getDraggables();

        const list = drag.item.el.closest("[data-gdnd-drop]");

        const listElements = Array.from(draggablesByList.keys());

        // TODO currently limits to same list
        // const collidableDraggables = (list && draggablesByList.get(list)) || [];
        const collidableDraggables = draggables; //(list && draggablesByList.get(list)) || [];

        const {
          deltaX,
          deltaY,
          rect: transformedRect,
        } = getTransformedRect() || {};

        if (!transformedRect) {
          return loop();
        }

        const buildCollisionIndex = (candidates: Element[]) => {
          const dimensions: ElData[] = [];

          // BUILD COLLISION INDEX
          for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];

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

          return sorted;
        };

        const getDeepestMouseImpact = (index: ElData[]) => {
          // FIND COLLISION
          let impact: Impact | null = null;

          for (let i = 0; i < index.length; i++) {
            const candidate = index[i];

            // TODO calculate ahead of time
            const candidateCenter = {
              x: candidate.rect.left + candidate.rect.width / 2,
              y: candidate.rect.top + candidate.rect.height / 2,
            };

            let position = lastImpact?.position;

            if (axis === "x") {
              position =
                global.mousePosition.x > candidateCenter.x
                  ? "afterend"
                  : "beforebegin";
            } else {
              position =
                global.mousePosition.y > candidateCenter.y
                  ? "afterend"
                  : "beforebegin";
            }

            if (
              global.mousePosition.x > candidate.rect.left &&
              global.mousePosition.x < candidate.rect.right &&
              global.mousePosition.y > candidate.rect.top &&
              global.mousePosition.y < candidate.rect.bottom
            ) {
              if (impact) {
                if (!impact.el.contains(candidate.el)) {
                  continue;
                }
              }

              impact = {
                ...candidate,
                center: candidateCenter,
                position: position || "afterend",
              };
            }
          }

          return impact;
        };

        const getEdgeOverMidpointImpact = (index: ElData[]) => {
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

          for (let i = 0; i < index.length; i++) {
            const candidate = index[i];

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

          return impact;
        };

        const listCollisionIndex = buildCollisionIndex(listElements);

        const listImpact = getDeepestMouseImpact(listCollisionIndex);

        console.log("list impact", listImpact?.el, listElements);

        if (!listImpact) {
          console.warn("Not dragging over list");

          return loop();
        }

        const candidates = draggablesByList.get(listImpact.el);

        if (!candidates) {
          console.warn("No candidates for list");

          return loop();
        }

        const itemCollisionIndex = buildCollisionIndex(candidates);

        const impact = getEdgeOverMidpointImpact(itemCollisionIndex);

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
