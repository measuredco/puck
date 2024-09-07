import { renderHook, act } from "@testing-library/react";
import { usePuckHistory } from "../use-puck-history";
import { HistoryStore } from "../use-history-store";
import { defaultAppState } from "../../components/Puck/context";

jest.mock("react-hotkeys-hook");
jest.mock("../use-history-store");

const historyStore = {
  hasPast: false,
  prevHistory: { data: null },
  nextHistory: { data: null },
  back: jest.fn(),
  forward: jest.fn(),
  setHistories: jest.fn(),
  setHistoryIndex: jest.fn(),
} as unknown as HistoryStore;

const initialAppState = defaultAppState;
const dispatch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("use-puck-history", () => {
  test("back function does not call dispatch when there is no history", () => {
    const { result } = renderHook(() =>
      usePuckHistory({ dispatch, initialAppState, historyStore })
    );

    act(() => {
      result.current.back();
    });

    expect(historyStore.back).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("back function calls dispatch when there is a history", () => {
    historyStore.hasPast = true;
    historyStore.prevHistory = {
      state: {
        ...defaultAppState,
        ui: { ...defaultAppState.ui, leftSideBarVisible: false },
      },
    };

    const { result } = renderHook(() =>
      usePuckHistory({ dispatch, initialAppState, historyStore })
    );

    act(() => {
      result.current.back();
    });

    expect(historyStore.back).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: "set",
      state: historyStore.prevHistory?.state || initialAppState,
    });
  });

  test("forward function does not call dispatch when there is no future", () => {
    historyStore.hasPast = false;
    historyStore.nextHistory = null;

    const { result } = renderHook(() =>
      usePuckHistory({ dispatch, initialAppState, historyStore })
    );

    act(() => {
      result.current.forward();
    });

    expect(historyStore.forward).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("forward function calls dispatch when there is a future", () => {
    historyStore.nextHistory = {
      state: {
        ...defaultAppState,
        ui: { ...defaultAppState.ui, leftSideBarVisible: false },
      },
    };

    const { result } = renderHook(() =>
      usePuckHistory({ dispatch, initialAppState, historyStore })
    );

    act(() => {
      result.current.forward();
    });

    expect(historyStore.forward).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: "set",
      state: historyStore.nextHistory?.state,
    });
  });

  test("setHistories calls dispatch to last history item", () => {
    const { result } = renderHook(() =>
      usePuckHistory({ dispatch, initialAppState, historyStore })
    );

    const updatedHistories = [
      {
        id: "1",
        state: {
          one: "foo 1",
          two: "bar 1",
        },
      },
      {
        id: "2",
        state: {
          one: "foo 2",
          two: "bar 2",
        },
      },
    ];

    act(() => {
      result.current.setHistories(updatedHistories);
    });

    expect(historyStore.setHistories).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: "set",
      state: updatedHistories[1].state,
    });
  });

  test("setHistoryIndex calls dispatch on the history at that index", () => {
    const updatedHistories = [
      {
        id: "1",
        state: {
          one: "foo 1",
          two: "bar 1",
        },
      },
      {
        id: "2",
        state: {
          one: "foo 2",
          two: "bar 2",
        },
      },
    ];
    historyStore.histories = updatedHistories;

    const { result } = renderHook(() =>
      usePuckHistory({ dispatch, initialAppState, historyStore })
    );

    act(() => {
      result.current.setHistoryIndex(0);
    });

    expect(historyStore.setHistoryIndex).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: "set",
      state: updatedHistories[0].state,
    });
  });

  test("setHistoryIndex does not call dispatch when index out of bounds", () => {
    const { result } = renderHook(() =>
      usePuckHistory({ dispatch, initialAppState, historyStore })
    );

    act(() => {
      result.current.setHistoryIndex(5);
    });

    expect(historyStore.setHistoryIndex).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
