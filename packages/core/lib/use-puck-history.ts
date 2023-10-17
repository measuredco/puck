import type { AppState } from "../types/Config";
import { useEffect } from "react";
import { PuckAction } from "../reducer";
import { useActionHistory } from "./use-action-history";
import { useHotkeys } from "react-hotkeys-hook";
import EventEmitter from "event-emitter";
import { useDebouncedCallback, useDebounce } from "use-debounce";

const DEBOUNCE_TIME = 250;
export const RECORD_DIFF = "RECORD_DIFF";
export const historyEmitter = EventEmitter();
export const recordDiff = (newAppState: AppState) =>
  historyEmitter.emit(RECORD_DIFF, newAppState);

export const _recordHistory = ({
  snapshot,
  newSnapshot,
  record,
  dispatch,
}: {
  snapshot: Partial<AppState>;
  newSnapshot: Partial<AppState>;
  record: (params: any) => void;
  dispatch: (action: PuckAction) => void;
}) => {
  if (JSON.stringify(snapshot) === JSON.stringify(newSnapshot)) return;

  record({
    forward: () => {
      dispatch({ type: "set", state: newSnapshot });
    },
    rewind: () => {
      dispatch({ type: "set", state: snapshot });
    },
  });
};

export function usePuckHistory({
  appState,
  dispatch,
}: {
  appState: AppState;
  dispatch: (action: PuckAction) => void;
}) {
  const { canForward, canRewind, rewind, forward, record } = useActionHistory();

  useHotkeys("meta+z", rewind, { preventDefault: true });
  useHotkeys("meta+shift+z", forward, { preventDefault: true });
  useHotkeys("meta+y", forward, { preventDefault: true });

  const [snapshot] = useDebounce(appState, DEBOUNCE_TIME);

  const handleRecordDiff = useDebouncedCallback((newAppState: AppState) => {
    return _recordHistory({
      snapshot,
      newSnapshot: newAppState,
      record,
      dispatch,
    });
  }, DEBOUNCE_TIME);

  useEffect(() => {
    historyEmitter.on(RECORD_DIFF, handleRecordDiff);
    return () => {
      historyEmitter.off(RECORD_DIFF, handleRecordDiff);
    };
  }, [handleRecordDiff]);

  return {
    canForward,
    canRewind,
    rewind,
    forward,
  };
}
