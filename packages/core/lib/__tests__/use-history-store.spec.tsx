import { renderHook, act, type RenderHookResult } from "@testing-library/react";
import { useHistoryStore } from "../use-history-store";

jest.mock("use-debounce", () => ({
  useDebouncedCallback: jest.fn((fn) => fn),
}));

describe("use-history-store", () => {
  let renderedHook: RenderHookResult<ReturnType<typeof useHistoryStore>, any>;

  beforeEach(() => {
    renderedHook = renderHook(() => useHistoryStore());
  });

  test("should have the correct initial state", () => {
    expect(renderedHook.result.current.hasPast).toBe(false);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(0);
  });

  test("should record the history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(2);
    expect(renderedHook.result.current.histories[0].data).toBe("Apples");
    expect(renderedHook.result.current.histories[1].data).toBe("Oranges");
    expect(renderedHook.result.current.currentHistory.data).toBe("Oranges");
  });

  test("should enable partial rewinds through history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(true);
    expect(renderedHook.result.current.currentHistory.data).toBe("Apples");
  });

  test("should enable full rewinds through history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.back());

    expect(renderedHook.result.current.hasPast).toBe(false);
    expect(renderedHook.result.current.hasFuture).toBe(true);
    expect(renderedHook.result.current.currentHistory).toBeFalsy();
  });

  test("should enable partial fast-forwards through history", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.forward());

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(true);
    expect(renderedHook.result.current.currentHistory.data).toBe("Apples");
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
    expect(renderedHook.result.current.currentHistory.data).toBe("Oranges");
  });

  test("should replace the history if record is triggered after back", () => {
    act(() => renderedHook.result.current.record("Apples"));
    act(() => renderedHook.result.current.record("Oranges"));
    act(() => renderedHook.result.current.back());
    act(() => renderedHook.result.current.record("Banana"));

    expect(renderedHook.result.current.hasPast).toBe(true);
    expect(renderedHook.result.current.hasFuture).toBe(false);
    expect(renderedHook.result.current.histories.length).toBe(2);
    expect(renderedHook.result.current.histories[0].data).toBe("Apples");
    expect(renderedHook.result.current.histories[1].data).toBe("Banana");
    expect(renderedHook.result.current.currentHistory.data).toBe("Banana");
  });
});

describe("use-history-store-prefilled", () => {
  let renderedHook: RenderHookResult<ReturnType<typeof useHistoryStore>, any>;

  beforeEach(() => {
    renderedHook = renderHook(() =>
      useHistoryStore({
        histories: [
          { id: "0", data: {} },
          { id: "1", data: {} },
          { id: "2", data: {} },
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
