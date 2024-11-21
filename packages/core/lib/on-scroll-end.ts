export const onScrollEnd = (
  frame: Document | Element | null | undefined,
  cb: () => void
) => {
  let scrollTimeout: NodeJS.Timeout;

  const callback = function () {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function () {
      cb();

      frame?.removeEventListener("scroll", callback);
    }, 50);
  };

  frame?.addEventListener("scroll", callback);

  // Abort if no scroll timeout was configured after 50ms
  setTimeout(() => {
    if (!scrollTimeout) {
      cb();
    }
  }, 50);
};
