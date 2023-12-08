import type { AppState } from "../types/Config";
import { PuckAction } from "../reducer";
import { useHotkeys } from "react-hotkeys-hook";
import { HistoryStore } from "./use-history-store";

export type PuckHistory = {
  back: VoidFunction;
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
  const back = () => {
    if (historyStore.hasPast) {
      dispatch({
        type: "set",
        state: historyStore.prevHistory?.data || initialAppState,
      });

      historyStore.back();
    }
  };

  const forward = () => {
    if (historyStore.nextHistory) {
      dispatch({ type: "set", state: historyStore.nextHistory.data });

      historyStore.forward();
    }
  };

  useHotkeys("meta+z", back, { preventDefault: true });
  useHotkeys("meta+shift+z", forward, { preventDefault: true });
  useHotkeys("meta+y", forward, { preventDefault: true });

  return {
    back,
    forward,
    historyStore,
  };
}
