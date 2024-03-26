import { useState } from "react";
import { generateId } from "./generate-id";
import { useDebouncedCallback } from "use-debounce";
import deepDiff, { Diff } from "deep-diff";

export type History<D = any> = {
  id: string;
  data: D;
};

export type DiffedHistory<D> = History<Array<Diff<D>>>;

export type HistoryStore<D = any> = {
  index: number;
  currentHistory: History;
  hasPast: boolean;
  hasFuture: boolean;
  record: (data: D) => void;
  back: VoidFunction;
  forward: VoidFunction;
  nextHistory: DiffedHistory<D> | null;
  prevHistory: DiffedHistory<D> | null;
  histories: DiffedHistory<D>[];
};

const EMPTY_HISTORY_INDEX = -1;

export function useHistoryStore<D = any>(): HistoryStore<D> {
  const [histories, setHistories] = useState<DiffedHistory<D>[]>([]);
  const [lastData, setLastData] = useState<D>({} as D);

  const [index, setIndex] = useState(EMPTY_HISTORY_INDEX);

  const hasPast = index > EMPTY_HISTORY_INDEX;
  const hasFuture = index < histories.length - 1;

  const currentHistory = histories[index];
  const nextHistory = hasFuture ? histories[index + 1] : null;
  const prevHistory = hasPast ? histories[index - 1] : null;

  const record = useDebouncedCallback((newData: D) => {
    const diffedData = deepDiff(lastData, newData);

    if (!diffedData) return;

    const history: DiffedHistory<D> = {
      data: diffedData,
      id: generateId("history"),
    };

    setHistories((prev) => {
      const newVal = [...prev.slice(0, index + 1), history];

      setIndex(newVal.length - 1);

      setLastData(newData);

      return newVal;
    });
  }, 250);

  const back = () => {
    setIndex(index - 1);
  };

  const forward = () => {
    setIndex(index + 1);
  };

  return {
    index: index,
    currentHistory,
    hasPast,
    hasFuture,
    record,
    back,
    forward,
    nextHistory,
    prevHistory,
    histories,
  };
}
