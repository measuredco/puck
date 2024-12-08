import { useEffect, useState } from "react";
import { getFrame } from "./get-frame";

const styles = `
/* Prevent user from interacting with underlying component */
[data-puck-component] * {
  pointer-events: none;
  user-select: none;
    -webkit-user-select: none;
}

[data-puck-component] {
  cursor: grab;
  pointer-events: auto !important;
  user-select: none;
  -webkit-user-select: none;
}

[data-puck-disabled] {
  cursor: pointer;
}

/* Placeholder */
[data-puck-dragging]:not([data-dnd-dragging]) {
  background: var(--puck-color-azure-06) !important;
  border: none !important;
  color: #00000000 !important;
  opacity: 0.3 !important;
  outline: none !important;
  transition: none !important;
}

[data-puck-dragging]:not([data-dnd-dragging]) *, [data-puck-dragging]:not([data-dnd-dragging])::after, [data-puck-dragging]:not([data-dnd-dragging])::before {
  opacity: 0 !important;
}

[data-dnd-dragging] {
  pointer-events: none !important;
  outline: 2px var(--puck-color-azure-09) solid !important;
  outline-offset: -2px !important;
}
`;

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
