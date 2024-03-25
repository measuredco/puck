export const getFrame = () => {
  let frame: Element | Document | null | undefined =
    document.querySelector("#preview-frame");

  if (frame?.tagName === "IFRAME") {
    frame = (frame as HTMLIFrameElement)!.contentDocument;
  }

  return frame;
};
