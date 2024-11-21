import type { AppState, History } from "../types";
import { PuckAction } from "../reducer";
import { useHotkeys } from "react-hotkeys-hook";
import { HistoryStore } from "./use-history-store";
import { getFrame } from "./get-frame";

export type PuckHistory = {
  back: VoidFunction;
  forward: VoidFunction;
  setHistories: (histories: History[]) => void;
  setHistoryIndex: (index: number) => void;
  historyStore: HistoryStore;
};

export function usePuckHistory({
  dispatch,
  initialAppState,
  historyStore,
  iframeEnabled,
}: {
  dispatch: (action: PuckAction) => void;
  initialAppState: AppState;
  historyStore: HistoryStore;
  iframeEnabled: boolean;
}) {
  const back = () => {
    if (historyStore.hasPast) {
      dispatch({
        type: "set",
        state: historyStore.prevHistory?.state || initialAppState,
      });

      historyStore.back();
    }
  };

  const forward = () => {
    if (historyStore.nextHistory) {
      dispatch({ type: "set", state: historyStore.nextHistory.state });

      historyStore.forward();
    }
  };

  const backIframe = () => {
    if (iframeEnabled) {
      back();
    }
  };

  const forwardIframe = () => {
    if (iframeEnabled) {
      forward();
    }
  };

  const setHistories = (histories: History[]) => {
    // dispatch the last history index or initial state
    dispatch({
      type: "set",
      state: histories[histories.length - 1]?.state || initialAppState,
    });

    historyStore.setHistories(histories);
  };

  const setHistoryIndex = (index: number) => {
    if (historyStore.histories.length > index) {
      dispatch({
        type: "set",
        state: historyStore.histories[index]?.state || initialAppState,
      });

      historyStore.setHistoryIndex(index);
    }
  };

  const frame = getFrame();
  const resolvedFrame =
    typeof window !== "undefined" && frame !== document ? frame : undefined;

  // Host hotkeys
  useHotkeys("meta+z", back, { preventDefault: true });
  useHotkeys("meta+shift+z", forward, { preventDefault: true });
  useHotkeys("meta+y", forward, { preventDefault: true });

  // Iframe hotkeys
  useHotkeys("meta+z", backIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });
  useHotkeys("meta+shift+z", forwardIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });
  useHotkeys("meta+y", forwardIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });

  return {
    back,
    forward,
    historyStore,
    setHistories,
    setHistoryIndex,
  };
}
