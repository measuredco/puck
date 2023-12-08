import { useState } from "react";
import { generateId } from "./generate-id";
import { useDebouncedCallback } from "use-debounce";

export type History<D = any> = {
  id: string;
  data: D;
};

export type HistoryStore<D = any> = {
  index: number;
  currentHistory: History;
  canRewind: boolean;
  canForward: boolean;
  record: (data: D) => void;
  rewind: VoidFunction;
  forward: VoidFunction;
  nextHistory: History<D> | null;
  prevHistory: History<D> | null;
  histories: History<D>[];
};

const EMPTY_HISTORY_INDEX = -1;

export function useHistoryStore<D = any>(): HistoryStore<D> {
  const [histories, setHistories] = useState<History<D>[]>([]);

  const [index, setIndex] = useState(EMPTY_HISTORY_INDEX);
  // const index = useRef(EMPTY_HISTORY_INDEX);

  const canRewind = index > EMPTY_HISTORY_INDEX;
  const canForward = index < histories.length - 1;

  const currentHistory = histories[index];
  const nextHistory = canForward ? histories[index + 1] : null;
  const prevHistory = canRewind ? histories[index - 1] : null;

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

  const rewind = () => {
    setIndex(index - 1);
  };

  const forward = () => {
    setIndex(index + 1);
  };

  return {
    index: index,
    currentHistory,
    canRewind,
    canForward,
    record,
    rewind,
    forward,
    nextHistory,
    prevHistory,
    histories,
  };
}
