import { useEffect, useState } from "react";
import { useAppContext } from "../components/Puck/context";

const styles = `
/* Prevent user from interacting with underlying component */
[data-puck-component] * {
  user-select: none;
    -webkit-user-select: none;
}

[data-puck-component] {
  cursor: grab;
  pointer-events: auto !important;
  user-select: none;
  -webkit-user-select: none;
}

[data-dnd-placeholder] {
  background: var(--puck-color-azure-06) !important;
  border: none !important;
  color: #00000000 !important;
  opacity: 0.3 !important;
  outline: none !important;
  transition: none !important;
}

[data-dnd-placeholder] *, [data-dnd-placeholder]::after, [data-dnd-placeholder]::before {
  opacity: 0 !important;
}

[data-dnd-dragging] {
  pointer-events: none !important;
  outline: 2px var(--puck-color-azure-09) solid !important;
  outline-offset: -2px;
}
`;

export const useInjectStyleSheet = (
  initialStyles: string,
  iframeEnabled?: boolean
) => {
  const [el] = useState<HTMLStyleElement>(document.createElement("style"));

  useEffect(() => {
    el.innerHTML = initialStyles;

    if (iframeEnabled) {
      (
        document.getElementById("preview-frame") as HTMLIFrameElement
      ).contentWindow?.document.head.appendChild(el);
    }

    document.head.appendChild(el);
  }, [iframeEnabled]);

  return el;
};

export const useInjectGlobalCss = (iframeEnabled?: boolean) => {
  return useInjectStyleSheet(styles, iframeEnabled);
};
