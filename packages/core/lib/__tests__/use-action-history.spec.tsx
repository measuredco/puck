import { renderHook, type RenderHookResult } from "@testing-library/react";
import { useActionHistory } from "../use-action-history";

describe("given nothing", () => {
  let renderedHook: RenderHookResult<ReturnType<typeof useActionHistory>, any>;

  beforeEach(() => {
    renderedHook = renderHook(() => useActionHistory());
  });

  test("canForward should be false when there are no records", () => {
    const {
      result: {
        current: { canForward },
      },
    } = renderedHook;

    expect(canForward).toBe(false);
  });

  test("canRewind should be false when there are no records", () => {
    const {
      result: {
        current: { canRewind },
      },
    } = renderedHook;

    expect(canRewind).toBe(false);
  });
});
