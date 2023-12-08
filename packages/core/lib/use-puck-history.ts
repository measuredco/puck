import type { AppState } from "../types/Config";
import { PuckAction } from "../reducer";
import { useHotkeys } from "react-hotkeys-hook";
import { HistoryStore } from "./use-history-store";

export type PuckHistory = {
  rewind: VoidFunction;
  forward: VoidFunction;
  historyStore: HistoryStore;
};

export function usePuckHistory({
  dispatch,
  initialAppState,
  historyStore,
}: {
  dispatch: (action: PuckAction) => void;
  initialAppState: AppState;
  historyStore: HistoryStore;
}) {
  const rewind = () => {
    if (historyStore.canRewind) {
      dispatch({
        type: "set",
        state: historyStore.prevHistory?.data || initialAppState,
      });

      historyStore.rewind();
    }
  };

  const forward = () => {
    if (historyStore.nextHistory) {
      dispatch({ type: "set", state: historyStore.nextHistory.data });

      historyStore.forward();
    }
  };

  useHotkeys("meta+z", rewind, { preventDefault: true });
  useHotkeys("meta+shift+z", forward, { preventDefault: true });
  useHotkeys("meta+y", forward, { preventDefault: true });

  return {
    rewind,
    forward,
    historyStore,
  };
}
