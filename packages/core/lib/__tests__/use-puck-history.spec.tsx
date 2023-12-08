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
      id: "",
      data: {
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
      state: historyStore.prevHistory?.data || initialAppState,
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
      id: "",
      data: {
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
      state: historyStore.nextHistory?.data,
    });
  });
});
