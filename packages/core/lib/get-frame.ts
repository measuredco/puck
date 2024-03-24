export const getFrame = () => {
  let frame = document.querySelector("#preview-frame") as
    | HTMLElement
    | undefined;

  if (frame?.tagName === "IFRAME") {
    frame = (frame as HTMLIFrameElement)!.contentDocument!.body;
  }

  return frame;
};
