import { useState } from "react";
import { generateId } from "./generate-id";
import { useDebouncedCallback } from "use-debounce";

export type History<D = any> = {
  id: string;
  data: D;
};

export type HistoryStore<D = any> = {
  // Exposed via usePuck
  index: number;
  hasPast: boolean;
  hasFuture: boolean;
  histories: History<D>[];

  // Internal
  record: (data: D) => void;
  back: VoidFunction;
  forward: VoidFunction;
  currentHistory: History;
  nextHistory: History<D> | null;
  prevHistory: History<D> | null;
  setHistories: (histories: History[]) => void;
  setHistoryIndex: (index: number) => void;
};

const EMPTY_HISTORY_INDEX = -1;

export function useHistoryStore<D = any>(initialHistory?: {
  histories: History<any>[];
  index: number;
}): HistoryStore<D> {
  const [histories, setHistories] = useState<History<D>[]>(
    initialHistory?.histories ?? []
  );

  const [index, setIndex] = useState(
    initialHistory?.index ?? EMPTY_HISTORY_INDEX
  );

  const hasPast = index > EMPTY_HISTORY_INDEX;
  const hasFuture = index < histories.length - 1;

  const currentHistory = histories[index];
  const nextHistory = hasFuture ? histories[index + 1] : null;
  const prevHistory = hasPast ? histories[index - 1] : null;

  const record = useDebouncedCallback((data: D) => {
    const history: History = {
      data,
      id: generateId("history"),
    };

    setHistories((prev) => {
      const newVal = [...prev.slice(0, index + 1), history];

      setIndex(newVal.length - 1);

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
    setHistories,
    setHistoryIndex: setIndex,
  };
}
