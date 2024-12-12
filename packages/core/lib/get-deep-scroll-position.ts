export function getDeepScrollPosition(element: HTMLElement) {
  let totalScroll = {
    x: 0,
    y: 0,
  };

  let current: HTMLElement | null = element;

  while (current && current !== document.documentElement) {
    const parent: HTMLElement | null = current.parentElement;

    if (parent) {
      totalScroll.x += parent.scrollLeft;
      totalScroll.y += parent.scrollTop;
    }

    current = parent;
  }

  return totalScroll;
}
