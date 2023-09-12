import { renderHook, act, type RenderHookResult } from "@testing-library/react";
import { useActionHistory } from "../use-action-history";

describe("use-action-history", () => {
  let renderedHook: RenderHookResult<ReturnType<typeof useActionHistory>, any>;

  beforeEach(() => {
    renderedHook = renderHook(() => useActionHistory());
  });

  test("at first, canRewind should be false", () => {
    expect(renderedHook.result.current.canRewind).toBe(false);
  });

  test("at first, canForward should be false", () => {
    expect(renderedHook.result.current.canForward).toBe(false);
  });

  describe("when action history is recorded once", () => {
    let rewind: jest.Mock;
    let forward: jest.Mock;

    beforeEach(() => {
      rewind = jest.fn();
      forward = jest.fn();

      act(() =>
        renderedHook.result.current.record({
          rewind,
          forward,
        })
      );
    });

    test("canRewind should be true", () => {
      expect(renderedHook.result.current.canRewind).toBe(true);
    });

    test("canForward still should be false", () => {
      expect(renderedHook.result.current.canForward).toBe(false);
    });

    describe("and when rewind history once", () => {
      beforeEach(() => {
        act(() => renderedHook.result.current.rewind());
      });

      test("first history's rewind function should be executed", () => {
        expect(rewind).toBeCalledTimes(1);
      });

      test("canRewind should be false - there is no left can rewind history", () => {
        expect(renderedHook.result.current.canRewind).toBe(false);
      });

      test("canForward should be true", () => {
        expect(renderedHook.result.current.canForward).toBe(true);
      });

      describe("and when rewind history once again", () => {
        beforeEach(() => {
          act(() => renderedHook.result.current.rewind());
        });

        test("first history's rewind function is no more executed - there is no left can rewind history", () => {
          expect(rewind).toBeCalledTimes(1);
        });
      });

      describe("and when forward history once", () => {
        beforeEach(() => {
          act(() => renderedHook.result.current.forward());
        });

        test("first history's forward function should be executed", () => {
          expect(forward).toBeCalledTimes(1);
        });

        test("canForward should be false - there is no left can rewind history", () => {
          expect(renderedHook.result.current.canForward).toBe(false);
        });

        test("canRewind should be true", () => {
          expect(renderedHook.result.current.canRewind).toBe(true);
        });
      });
    });
  });

  describe("when run rewind all with action histories", () => {
    const actions = [
      { rewind: jest.fn(), forward: jest.fn() },
      { rewind: jest.fn(), forward: jest.fn() },
      { rewind: jest.fn(), forward: jest.fn() },
    ];

    beforeEach(() => {
      actions.forEach(({ rewind, forward }) => {
        act(() =>
          renderedHook.result.current.record({
            rewind,
            forward,
          })
        );
      });
    });

    test("rewind function of action should be execute", () => {
      actions.reverse().forEach(({ rewind }) => {
        act(() => renderedHook.result.current.rewind());
        expect(rewind).toBeCalled();
      });
    });

    test("canRewind should be true until before last rewind", () => {
      actions.reverse().forEach((_, i) => {
        act(() => renderedHook.result.current.rewind());
        expect(renderedHook.result.current.canRewind).toBe(
          i !== actions.length - 1
        );
      });
    });
  });

  describe("when run forward all with action histories (after all rewinded)", () => {
    const actions = [
      { rewind: jest.fn(), forward: jest.fn() },
      { rewind: jest.fn(), forward: jest.fn() },
      { rewind: jest.fn(), forward: jest.fn() },
    ];

    beforeEach(() => {
      actions.forEach(({ rewind, forward }) => {
        act(() =>
          renderedHook.result.current.record({
            rewind,
            forward,
          })
        );
      });
    });

    beforeEach(() => {
      actions.forEach(() => {
        act(() => renderedHook.result.current.rewind());
      });
    });

    test("forward function of action should be execute", () => {
      actions.forEach(({ forward }) => {
        act(() => renderedHook.result.current.forward());
        expect(forward).toBeCalled();
      });
    });

    test("canForward should be true until before last forward", () => {
      actions.forEach((_, i) => {
        act(() => renderedHook.result.current.forward());
        expect(renderedHook.result.current.canForward).toBe(
          i !== actions.length - 1
        );
      });
    });
  });
});
