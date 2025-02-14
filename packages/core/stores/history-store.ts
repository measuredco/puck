import { AppState, History } from "../types";
import { generateId } from "../lib/generate-id";
import { create } from "zustand";
import { getFrame } from "../lib/get-frame";
import { getAppStore, useAppStore } from "../stores/app-store";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export type HistoryStore<D = any> = {
  index: number;
  hasPast: () => boolean;
  hasFuture: () => boolean;
  histories: History<D>[];
  record: (data: D) => void;
  back: VoidFunction;
  forward: VoidFunction;
  currentHistory: () => History;
  nextHistory: () => History<D> | null;
  prevHistory: () => History<D> | null;
  setHistories: (histories: History[]) => void;
  setHistoryIndex: (index: number) => void;
  initialAppState: D;
};

const EMPTY_HISTORY_INDEX = 0;

function debounce(func: Function, timeout = 300) {
  let timer: NodeJS.Timeout;

  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

export type PuckHistory = {
  back: VoidFunction;
  forward: VoidFunction;
  setHistories: (histories: History[]) => void;
  setHistoryIndex: (index: number) => void;
  historyStore: HistoryStore;
};

const record = debounce((state: AppState) => {
  const { histories, index } = useHistoryStore.getState();

  const history: History = {
    state,
    id: generateId("history"),
  };

  // Don't use setHistories due to callback
  const newHistories = [...histories.slice(0, index + 1), history];

  useHistoryStore.setState({
    histories: newHistories,
    index: newHistories.length - 1,
  });
}, 250);

export const useHistoryStore = create<HistoryStore<AppState>>((set, get) => ({
  initialAppState: {} as AppState,
  index: EMPTY_HISTORY_INDEX,
  histories: [],
  hasPast: () => get().index > EMPTY_HISTORY_INDEX,
  hasFuture: () => get().index < get().histories.length - 1,
  prevHistory: () => {
    const s = get();

    return s.hasPast() ? s.histories[s.index - 1] : null;
  },
  nextHistory: () => {
    const s = get();

    return s.hasFuture() ? s.histories[s.index + 1] : null;
  },
  currentHistory: () => get().histories[get().index],
  back: () => {
    const store = get();

    if (store.hasPast()) {
      const { dispatch } = getAppStore();

      dispatch({
        type: "set",
        state: store.prevHistory()?.state || store.initialAppState,
      });

      set((s) => ({ index: s.index - 1 }));
    }
  },
  forward: () => {
    const store = get();

    if (store.hasFuture()) {
      const { dispatch } = getAppStore();

      dispatch({ type: "set", state: store.nextHistory()?.state || {} });

      set((s) => ({ index: s.index + 1 }));
    }
  },
  setHistories: (histories: History[]) => {
    const store = get();
    const { dispatch } = getAppStore();

    dispatch({
      type: "set",
      state:
        store.histories[store.histories.length - 1]?.state ||
        store.initialAppState,
    });

    set({ histories, index: histories.length - 1 });
  },
  setHistoryIndex: (index) => {
    const store = get();
    const { dispatch } = getAppStore();

    dispatch({
      type: "set",
      state: store.histories[store.index]?.state || store.initialAppState,
    });

    set({ index });
  },
  record,
}));

export function useRegisterHistoryStore({
  histories,
  index,
  initialAppState,
  iframeEnabled,
}: {
  histories: History<any>[];
  index: number;
  initialAppState: AppState;
  iframeEnabled: boolean;
}) {
  useEffect(
    () =>
      useHistoryStore.setState({
        histories,
        index,
        initialAppState,
      }),
    [histories, index, initialAppState]
  );

  const back = () => {
    useHistoryStore.getState().back();
  };

  const forward = () => {
    useHistoryStore.getState().forward();
  };

  const backIframe = () => {
    if (iframeEnabled) {
      back();
    }
  };

  const forwardIframe = () => {
    if (iframeEnabled) {
      forward();
    }
  };

  useAppStore((s) => s.status);

  const frame = getFrame();
  const resolvedFrame =
    typeof window !== "undefined" && frame !== document ? frame : undefined;

  // Host hotkeys
  useHotkeys("meta+z", back, { preventDefault: true });
  useHotkeys("meta+shift+z", forward, { preventDefault: true });
  useHotkeys("meta+y", forward, { preventDefault: true });

  // Iframe hotkeys
  // TODO these aren't working now
  useHotkeys("meta+z", backIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });
  useHotkeys("meta+shift+z", forwardIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });
  useHotkeys("meta+y", forwardIframe, {
    preventDefault: true,
    document: resolvedFrame,
  });
}
