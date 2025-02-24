import { AppState, History } from "../types";
import { generateId } from "../lib/generate-id";
import { create } from "zustand";
import { getAppStore } from "./app-store";
import { useEffect } from "react";
import { useHotkey } from "../lib/use-hotkey";

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

// Tidy the state before going back or forward
const tidyState = (state: AppState): AppState => {
  return {
    ...state,
    ui: {
      ...state.ui,
      field: {
        focus: null,
      },
    },
  };
};

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

      const state = tidyState(
        store.prevHistory()?.state || store.initialAppState
      );

      dispatch({
        type: "set",
        state,
      });

      set((s) => ({ index: s.index - 1 }));
    }
  },
  forward: () => {
    const store = get();

    if (store.hasFuture()) {
      const { dispatch } = getAppStore();

      const state = store.nextHistory()?.state;

      dispatch({ type: "set", state: state ? tidyState(state) : {} });

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
}: {
  histories: History<any>[];
  index: number;
  initialAppState: AppState;
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

  useHotkey({ meta: true, z: true }, back);
  useHotkey({ meta: true, shift: true, z: true }, forward);
  useHotkey({ meta: true, y: true }, forward);

  useHotkey({ ctrl: true, z: true }, back);
  useHotkey({ ctrl: true, shift: true, z: true }, forward);
  useHotkey({ ctrl: true, y: true }, forward);
}
