import type { Data } from "../types/Config";
import { useEffect } from "react";
import { PuckAction } from "./reducer";
import { useActionHistory } from "./use-action-history";
import { useHotkeys } from "react-hotkeys-hook";
import EventEmitter from "event-emitter";
import { useDebouncedCallback } from "use-debounce";
import deepDiff from "deep-diff";

const RECORD_DIFF = "RECORD_DIFF";
export const historyEmitter = EventEmitter();
export const recordDiff = (data: Data, newData: Data) =>
  historyEmitter.emit(RECORD_DIFF, data, newData);

export function usePuckHistory({
  data,
  dispatch,
}: {
  data: Data;
  dispatch: (action: PuckAction) => void;
}) {
  const { canForward, canRewind, rewind, forward, record } = useActionHistory();

  useHotkeys("ctrl+z", rewind, [rewind]);
  useHotkeys("ctrl+y", forward, [forward]);

  const handleRecordDiff = useDebouncedCallback((...args: [Data, Data]) => {
    const [_data, _newData] = args;
    const diff = deepDiff.diff(_data, _newData);

    if (!diff) {
      return;
    }

    record({
      forward: () => {
        const target = structuredClone(data);
        diff.reduce((target, change) => {
          deepDiff.applyChange(target, true, change);
          return target;
        }, target);
        dispatch({ type: "set", data: target });
      },
      rewind: () => {
        const target = structuredClone(data);
        diff.reduce((target, change) => {
          deepDiff.revertChange(target, true, change);
          return target;
        }, target);
        dispatch({ type: "set", data: target });
      },
    });
  }, 10);

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
