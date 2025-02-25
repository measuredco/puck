import { Dispatch, useCallback } from "react";
import { getFrame } from "./get-frame";
import { useHotkeys } from "react-hotkeys-hook";
import { PuckAction } from "../reducer";

export const usePreviewModeHotkeys = (
  dispatch: Dispatch<PuckAction>,
  iframeEnabled?: boolean
) => {
  const toggleInteractive = useCallback(() => {
    dispatch({
      type: "setUi",
      ui: (ui) => ({
        previewMode: ui.previewMode === "edit" ? "interactive" : "edit",
      }),
    });
  }, [dispatch]);

  const toggleInteractiveIframe = () => {
    if (iframeEnabled) {
      toggleInteractive();
    }
  };

  const frame = getFrame();
  const resolvedFrame =
    typeof window !== "undefined" && frame !== document ? frame : undefined;

  useHotkeys("meta+i", toggleInteractive, { preventDefault: true });
  useHotkeys("meta+i", toggleInteractiveIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });
  // For Windows
  useHotkeys("ctrl+i", toggleInteractive, { preventDefault: true });
  useHotkeys("ctrl+i", toggleInteractiveIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });
};
