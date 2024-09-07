import { renderHook, act, type RenderHookResult } from "@testing-library/react";
import { useHistoryStore } from "../use-history-store";

jest.mock("use-debounce", () => ({
  useDebouncedCallback: jest.fn((fn) => fn),
}));

describe("use-history-store", () => {
  let renderedHook: RenderHookResult<ReturnType<typeof useHistoryStore>, any>;

  beforeEach(() => {
    renderedHook = renderHook(() =>
      useHistoryStore({
        index: 0,
        histories: [{ state: "Strawberries", id: "initial" }],
      })
    );
  });

  test("should have the correct initial state", () => {
    expect(renderedHook.result.current.hasPast).toBe(false);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(1);
    expect(renderedHook.result.current.histories[0].state).toBe("Strawberries");
  });

  test("should record the history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(3);
    expect(renderedHook.result.current.histories[1].state).toBe("Apples");
    expect(renderedHook.result.current.histories[2].state).toBe("Oranges");
    expect(renderedHook.result.current.currentHistory.state).toBe("Oranges");
  });

  test("should enable partial rewinds through history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(true);
    expect(renderedHook.result.current.currentHistory.state).toBe("Apples");
  });

  test("should enable full rewinds through history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.back());

    expect(renderedHook.result.current.hasPast).toBe(false);
    expect(renderedHook.result.current.hasFuture).toBe(true);
    expect(renderedHook.result.current.currentHistory.state).toBe(
      "Strawberries"
    );
  });

  test("should enable partial fast-forwards through history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.forward());

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(true);
    expect(renderedHook.result.current.currentHistory.state).toBe("Apples");
  });

  test("should enable full fast-forwards through history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.forward());
    act(() => renderedHook.result.current.forward());

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.currentHistory.state).toBe("Oranges");
  });

  test("should replace the history if record is triggered after back", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.record("Banana"));

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(3);
    expect(renderedHook.result.current.histories[1].state).toBe("Apples");
    expect(renderedHook.result.current.histories[2].state).toBe("Banana");
    expect(renderedHook.result.current.currentHistory.state).toBe("Banana");
  });

  test("should reset histories and index on setHistories", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() =>
      renderedHook.result.current.setHistories([
        {
          id: "1",
          state: "Oreo",
        },
      ])
    );

    expect(renderedHook.result.current.hasPast).toBe(false);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(1);
    expect(renderedHook.result.current.histories[0].state).toBe("Oreo");
    expect(renderedHook.result.current.currentHistory.state).toBe("Oreo");
    expect(renderedHook.result.current.index).toBe(0);
  });

  test("should update index on setHistoryIndex", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.setHistoryIndex(0));

    expect(renderedHook.result.current.hasPast).toBe(false);
    expect(renderedHook.result.current.hasFuture).toBe(true);
    expect(renderedHook.result.current.histories.length).toBe(3);
    expect(renderedHook.result.current.currentHistory.state).toBe(
      "Strawberries"
    );
    expect(renderedHook.result.current.index).toBe(0);
  });
});

describe("use-history-store-prefilled", () => {
  let renderedHook: RenderHookResult<ReturnType<typeof useHistoryStore>, any>;

  beforeEach(() => {
    renderedHook = renderHook(() =>
      useHistoryStore({
        histories: [
          { id: "0", state: {} },
          { id: "1", state: {} },
          { id: "2", state: {} },
        ],
        index: 2,
      })
    );
  });

  test("should have the correct initial state", () => {
    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(3);
  });
});
