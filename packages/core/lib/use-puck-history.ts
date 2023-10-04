import type { Data } from "../types/Config";
import { useEffect } from "react";
import { PuckAction } from "./reducer";
import { useActionHistory } from "./use-action-history";
import { useHotkeys } from "react-hotkeys-hook";
import EventEmitter from "event-emitter";
import { useDebouncedCallback, useDebounce } from "use-debounce";
import { diff, applyChange, revertChange } from "deep-diff";

const DEBOUNCE_TIME = 250;
const RECORD_DIFF = "RECORD_DIFF";
export const historyEmitter = EventEmitter();
export const recordDiff = (newData: Data) =>
  historyEmitter.emit(RECORD_DIFF, newData);

export function usePuckHistory({
  data,
  dispatch,
}: {
  data: Data;
  dispatch: (action: PuckAction) => void;
}) {
  const { canForward, canRewind, rewind, forward, record } = useActionHistory();

  useHotkeys("meta+z", rewind, { preventDefault: true });
  useHotkeys("meta+shift+z", forward, { preventDefault: true });
  useHotkeys("meta+y", forward, { preventDefault: true });

  const [snapshot] = useDebounce(data, DEBOUNCE_TIME);

  const handleRecordDiff = useDebouncedCallback((newData: Data) => {
    const _diff = diff(snapshot, newData);

    if (!_diff) {
      return;
    }

    record({
      forward: () => {
        const target = structuredClone(data);
        _diff.reduce((target, change) => {
          applyChange(target, true, change);
          return target;
        }, target);
        dispatch({ type: "set", data: target });
      },
      rewind: () => {
        const target = structuredClone(data);
        _diff.reduce((target, change) => {
          revertChange(target, true, change);
          return target;
        }, target);
        dispatch({ type: "set", data: target });
      },
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
    record,
  };
}
