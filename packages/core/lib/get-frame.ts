export const getFrame = () => {
  if (typeof window === "undefined") return;

  let frameEl: Element | Document | null | undefined =
    document.querySelector("#preview-frame");

  if (frameEl?.tagName === "IFRAME") {
    return (frameEl as HTMLIFrameElement)!.contentDocument || document;
  }

  return frameEl?.ownerDocument || document;
};
