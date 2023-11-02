import { useState } from "react";
import { generateId } from "./generate-id";

export type History = {
  id: string;
  forward: VoidFunction;
  rewind: VoidFunction;
};

const EMPTY_HISTORY_INDEX = -1;

export function useActionHistory() {
  const [histories, setHistories] = useState<History[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] =
    useState(EMPTY_HISTORY_INDEX);

  const currentHistory = histories[currentHistoryIndex];
  const canRewind = currentHistoryIndex > EMPTY_HISTORY_INDEX;
  const canForward = currentHistoryIndex < histories.length - 1;

  const record = (params: Pick<History, "forward" | "rewind">) => {
    const history: History = {
      id: generateId("history"),
      ...params,
    };

    setHistories((prev) => [
      ...prev.slice(0, currentHistoryIndex + 1),
      history,
    ]);
    setCurrentHistoryIndex((prev) => prev + 1);
  };

  const rewind = () => {
    if (canRewind) {
      currentHistory.rewind();
      setCurrentHistoryIndex((prev) => prev - 1);
    }
  };

  const forward = () => {
    const forwardHistory = histories[currentHistoryIndex + 1];

    if (canForward && forwardHistory) {
      forwardHistory.forward();
      setCurrentHistoryIndex((prev) => prev + 1);
    }
  };

  return {
    currentHistory,
    canRewind,
    canForward,
    record,
    rewind,
    forward,
  };
}
