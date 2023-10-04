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

  describe("when a single action history is recorded", () => {
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

    describe("and when history is rewound once", () => {
      beforeEach(() => {
        act(() => renderedHook.result.current.rewind());
      });

      test("the rewind function should be executed", () => {
        expect(rewind).toBeCalledTimes(1);
      });

      test("canRewind should be false - there is no rewind history remaining", () => {
        expect(renderedHook.result.current.canRewind).toBe(false);
      });

      test("canForward should be true", () => {
        expect(renderedHook.result.current.canForward).toBe(true);
      });

      describe("and then rewound again", () => {
        beforeEach(() => {
          act(() => renderedHook.result.current.rewind());
        });

        test("the rewind function is not executed again - there is no rewind history remaining", () => {
          expect(rewind).toBeCalledTimes(1);
        });
      });

      describe("and then fast-forwarded once", () => {
        beforeEach(() => {
          act(() => renderedHook.result.current.forward());
        });

        test("the forward function should be executed", () => {
          expect(forward).toBeCalledTimes(1);
        });

        test("canForward should be false - there is no forward history remaining", () => {
          expect(renderedHook.result.current.canForward).toBe(false);
        });

        test("canRewind should be true", () => {
          expect(renderedHook.result.current.canRewind).toBe(true);
        });
      });
    });
  });

  describe("when multiple action histories are recorded and rewound", () => {
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

    test("the rewind function should be executed each time an action is rewound", () => {
      actions.reverse().forEach(({ rewind }) => {
        act(() => renderedHook.result.current.rewind());
        expect(rewind).toBeCalled();
      });
    });

    test("canRewind should be true until the start of the history is reached", () => {
      actions.reverse().forEach((_, i) => {
        act(() => renderedHook.result.current.rewind());
        expect(renderedHook.result.current.canRewind).toBe(
          i !== actions.length - 1
        );
      });
    });
  });

  describe("when multiple action histories are recorded, rewound and then fast-forwarded", () => {
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

    test("the forward function should be executed each time an action is fast-forwarded", () => {
      actions.forEach(({ forward }) => {
        act(() => renderedHook.result.current.forward());
        expect(forward).toBeCalled();
      });
    });

    test("canForward should be true until the end of the history is reached", () => {
      actions.forEach((_, i) => {
        act(() => renderedHook.result.current.forward());
        expect(renderedHook.result.current.canForward).toBe(
          i !== actions.length - 1
        );
      });
    });
  });

  describe("in the middle of history", () => {
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
      act(() => renderedHook.result.current.rewind());
    });

    test("the forward history is overridden when recording a new action ", () => {
      const newAction = { rewind: jest.fn(), forward: jest.fn() };
      act(() => renderedHook.result.current.record(newAction));

      expect(renderedHook.result.current.canForward).toBe(false);
    });
  });
});
