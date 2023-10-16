import type { AppData } from "../types/Config";
import { useEffect } from "react";
import { PuckAction } from "../reducer";
import { useActionHistory } from "./use-action-history";
import { useHotkeys } from "react-hotkeys-hook";
import EventEmitter from "event-emitter";
import { useDebouncedCallback, useDebounce } from "use-debounce";

const DEBOUNCE_TIME = 250;
export const RECORD_DIFF = "RECORD_DIFF";
export const historyEmitter = EventEmitter();
export const recordDiff = (newAppData: AppData) =>
  historyEmitter.emit(RECORD_DIFF, newAppData);

export const _recordHistory = ({ snapshot, newSnapshot, record, dispatch }) => {
  record({
    forward: () => {
      dispatch({ type: "set", appData: newSnapshot });
    },
    rewind: () => {
      dispatch({ type: "set", appData: snapshot });
    },
  });
};

export function usePuckHistory({
  appData,
  dispatch,
}: {
  appData: AppData;
  dispatch: (action: PuckAction) => void;
}) {
  const { canForward, canRewind, rewind, forward, record } = useActionHistory();

  useHotkeys("meta+z", rewind, { preventDefault: true });
  useHotkeys("meta+shift+z", forward, { preventDefault: true });
  useHotkeys("meta+y", forward, { preventDefault: true });

  const [snapshot] = useDebounce(appData, DEBOUNCE_TIME);

  const handleRecordDiff = useDebouncedCallback((newAppData: AppData) => {
    return _recordHistory({
      snapshot,
      newSnapshot: newAppData,
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
