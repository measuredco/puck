import { useEffect, useState } from "react";
import { getFrame } from "./get-frame";

const styles = ``;

export const useInjectStyleSheet = (
  initialStyles: string,
  iframeEnabled?: boolean
) => {
  const [el, setEl] = useState<HTMLStyleElement>();

  useEffect(() => {
    setEl(document.createElement("style"));
  }, []);

  useEffect(() => {
    if (!el || typeof window === "undefined") {
      return;
    }

    el.innerHTML = initialStyles;

    if (iframeEnabled) {
      const frame = getFrame();
      frame?.head?.appendChild(el);
    }

    document.head.appendChild(el);
  }, [iframeEnabled, el]);

  return el;
};

export const useInjectGlobalCss = (iframeEnabled?: boolean) => {
  return useInjectStyleSheet(styles, iframeEnabled);
};
