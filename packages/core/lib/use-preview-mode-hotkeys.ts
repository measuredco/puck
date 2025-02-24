import { useCallback } from "react";
import { useHotkey } from "./use-hotkey";
import { getAppStore } from "../stores/app-store";

export const usePreviewModeHotkeys = () => {
  const toggleInteractive = useCallback(() => {
    console.log("toggle preview", getAppStore().state.ui.previewMode);

    const dispatch = getAppStore().dispatch;

    dispatch({
      type: "setUi",
      ui: (ui) => ({
        previewMode: ui.previewMode === "edit" ? "interactive" : "edit",
      }),
    });
  }, []);

  useHotkey({ meta: true, i: true }, toggleInteractive);
  useHotkey({ ctrl: true, i: true }, toggleInteractive); // Windows
};
