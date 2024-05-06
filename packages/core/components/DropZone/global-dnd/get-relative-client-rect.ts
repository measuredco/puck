function getElementsBetween(
  innerElement: HTMLElement,
  outerElement: HTMLElement
): HTMLElement[] {
  // Validate inputs
  if (!innerElement || !outerElement) {
    throw new Error("One or both of the provided elements are null.");
  }
  if (!outerElement.contains(innerElement)) {
    throw new Error("The outer element does not contain the inner element.");
  }

  const elementsBetween: HTMLElement[] = [];
  let currentElement: HTMLElement | null = innerElement.parentElement;

  // Traverse up from the inner element to the outer element
  while (currentElement && currentElement !== outerElement) {
    elementsBetween.unshift(currentElement);
    currentElement = currentElement.parentElement;
  }

  elementsBetween.unshift(outerElement);

  return elementsBetween;
}

function getAllParentNodesUpToBody(element: HTMLElement): HTMLElement[] {
  const parentNodes: HTMLElement[] = [];
  let currentElement: HTMLElement | null = element.parentElement;

  // Traverse up from the element to the body element
  while (currentElement && currentElement.tagName !== "BODY") {
    parentNodes.push(currentElement);
    currentElement = currentElement.parentElement;
  }

  // Optionally, include the body element if you need it in the list
  if (currentElement && currentElement.tagName === "BODY") {
    parentNodes.push(currentElement);
  }

  return parentNodes;
}

/**
 * Gets the client rect, offset by:
 * 1. transform
 * 2. scroll position
 *
 * @param el
 * @param relativeTo
 * @returns
 */
export const getRelativeClientRect = (
  el: HTMLElement,
  relativeTo: HTMLElement
): HTMLElement | null => {
  const elements = getElementsBetween(el, relativeTo);
  const rects = elements.map((el) => el.getBoundingClientRect());

  elements.forEach((el) => {
    console.log(el, el.getBoundingClientRect(), el.scrollTop);
  });

  return null;
  // return findNearestList(el.parentElement);
};
