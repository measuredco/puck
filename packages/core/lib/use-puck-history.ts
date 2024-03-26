import type { AppState } from "../types/Config";
import { PuckAction } from "../reducer";
import { useHotkeys } from "react-hotkeys-hook";
import { DiffedHistory, HistoryStore } from "./use-history-store";
import { Diff, applyChange, applyDiff } from "deep-diff";

export type PuckHistory = {
  back: VoidFunction;
  forward: VoidFunction;
  historyStore: HistoryStore;
};

export function usePuckHistory({
  dispatch,
  initialAppState,
  appState,
  historyStore,
}: {
  dispatch: (action: PuckAction) => void;
  initialAppState: AppState;
  appState: AppState;
  historyStore: HistoryStore<AppState>;
}) {
  const applyHistory = (history: DiffedHistory<AppState> | null) => {
    if (history) {
      const diff = history.data;

      const target = structuredClone(appState);

      diff.reduce((target, change) => {
        applyChange(target, true, change);
        return target;
      }, target);

      dispatch({ type: "set", state: target });
    } else {
      dispatch({ type: "set", state: initialAppState });
    }
  };

  const back = () => {
    if (historyStore.hasPast) {
      applyHistory(historyStore.prevHistory);

      historyStore.back();
    }
  };

  const forward = () => {
    if (historyStore.hasFuture) {
      applyHistory(historyStore.nextHistory);

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
