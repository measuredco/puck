export const findNearestList = (el: HTMLElement): HTMLElement | null => {
  if (el.getAttribute("data-drop-list")) {
    return el;
  }

  if (!el.parentElement) {
    const refWindow = el.ownerDocument.defaultView;

    if (
      refWindow &&
      refWindow.self !== refWindow.parent &&
      refWindow.frameElement
    ) {
      const iframe = refWindow.frameElement as HTMLIFrameElement;

      return findNearestList(iframe);
    }

    return null;
  }

  return findNearestList(el.parentElement);
};
