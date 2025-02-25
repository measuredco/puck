import { renderHook, act, waitFor } from "@testing-library/react";
import { useResolvedFields } from "../use-resolved-fields";
import { useAppContext } from "../../components/Puck/context";
import { useParent } from "../use-parent";
import { AppState, ComponentData, Data, Fields, UiState } from "../../types";

jest.mock("../../components/Puck/context", () => ({
  useAppContext: jest.fn(),
}));

jest.mock("../use-parent", () => ({
  useParent: jest.fn(),
}));

const state: { data: Data; ui: Partial<UiState> } = {
  data: { root: { props: {} }, content: [] },
  ui: {
    itemSelector: null,
  },
};

const blankContext = {
  selectedItem: undefined as ComponentData | undefined,
  state,
  config: {
    root: {
      fields: { title: { type: "text" } },
    },
    components: {
      Flex: {
        fields: { title: { type: "number" } },
      },
      Heading: {
        fields: { title: { type: "text" } },
      },
    },
  },
};

const blankContextWithData = {
  ...blankContext,
  state: {
    ...blankContext.state,
    data: {
      ...blankContext.state.data,
      content: [
        ...blankContext.state.data.content,
        {
          type: "Heading",
          props: {
            id: "heading-1",
            title: "Hello, world",
          },
        },
        {
          type: "Flex",
          props: {
            id: "flex-1",
            title: 1,
          },
        },
      ],
    },
  },
};

const contextWithRootResolver = (resolveFields: any) => {
  return {
    ...blankContext,
    config: {
      ...blankContext.config,
      root: {
        ...blankContext.config.root,
        resolveFields,
      },
    },
  };
};

const contextWithItemResolver = (resolveFields: any) => {
  return {
    ...blankContextWithData,
    state: {
      ...blankContext.state,
      data: {
        ...blankContext.state.data,
        content: [
          {
            type: "Heading",
            props: {
              id: "heading-1",
              title: "Hello, world",
            },
          },
        ],
      },
    },
    config: {
      ...blankContext.config,
      components: {
        Heading: {
          ...blankContext.config.components.Heading,
          resolveFields,
        },
      },
    },
  };
};

const contextWithDropZoneItemResolver = (resolveFields: any) => {
  return {
    ...blankContext,
    state: {
      ...blankContext.state,
      data: {
        ...blankContext.state.data,
        content: [
          {
            type: "Flex",
            props: {
              id: "flex-1",
            },
          },
        ],
        zones: {
          // Create an imaginary zone
          "flex-1:zone": [
            {
              type: "Heading",
              props: {
                id: "heading-1",
                title: "Hello, world",
              },
            },
          ],
        },
      },
    },
    config: {
      ...blankContext.config,
      components: {
        Flex: {},
        Heading: {
          ...blankContext.config.components.Heading,
          resolveFields,
        },
      },
    },
  };
};

const useAppContextMock = useAppContext as jest.Mock;
const useParentMock = useParent as jest.Mock;

type RenderHookReturn = ReturnType<
  typeof renderHook<[Fields, boolean], boolean>
>;

describe("use-resolved-fields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultParams: RenderHookReturn = {
    result: { current: [{}, false] },
    rerender: () => {},
    unmount: () => {},
  };

  let params: RenderHookReturn = defaultParams;

  beforeEach(() => {
    params = defaultParams;
    useAppContextMock.mockClear();
    useParentMock.mockClear();
  });

  it("returns the default fields when no resolver is defined", async () => {
    useAppContextMock.mockReturnValue(blankContext);
    useParentMock.mockReturnValue(null);

    params = renderHook(() => useResolvedFields());
    const { result } = params;

    expect(result.current[0]).toEqual({ title: { type: "text" } });
    expect(result.current[1]).toBe(false);
  });

  describe("when changing the selected item", () => {
    const contextWithSelectedItem = {
      ...blankContextWithData,
      state: {
        ...blankContextWithData.state,
        ui: {
          ...blankContextWithData.state.ui,
          itemSelector: { zone: "default-zone", index: 0 },
        },
      },
      selectedItem: blankContextWithData.state.data.content[0],
    };

    const contextWithSelectedItemAlt = {
      ...blankContextWithData,
      state: {
        ...blankContextWithData.state,
        ui: {
          ...blankContextWithData.state.ui,
          itemSelector: { zone: "default-zone", index: 1 },
        },
      },
      selectedItem: blankContextWithData.state.data.content[1],
    };

    it("(failure case) returns the old fields, if NOT checking the id, with value check disabled", async () => {
      useAppContextMock.mockReturnValue(contextWithSelectedItem);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() =>
          useResolvedFields({ _skipValueCheck: true, _skipIdCheck: true })
        ); // we need to skip the value check, as this will cause a re-render and make test pass in any scenario
      });

      const { result, rerender } = params;

      expect(result.current[0]).toEqual({ title: { type: "text" } });
      expect(result.current[1]).toBe(false);

      useAppContextMock.mockReturnValue(contextWithSelectedItemAlt);

      await act(() => {
        rerender();
      });

      expect(result.current[0]).toEqual({ title: { type: "text" } }); // We're asserting the failure. If behaving correctly, this would be `number` (see case below).
    });

    it("returns the default fields, if checking the id, with value check disabled", async () => {
      useAppContextMock.mockReturnValue(contextWithSelectedItem);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() => useResolvedFields({ _skipValueCheck: true })); // we need to skip the value check, as this will cause a re-render and make test pass in any scenario
      });

      const { result, rerender } = params;

      expect(result.current[0]).toEqual({ title: { type: "text" } });
      expect(result.current[1]).toBe(false);

      useAppContextMock.mockReturnValue(contextWithSelectedItemAlt);

      await act(() => {
        rerender();
      });

      expect(result.current[0]).toEqual({ title: { type: "number" } }); // We're asserting the success.
    });
  });

  describe("with resolveFields on the root", () => {
    it("calls it immediately", async () => {
      const mockResolveFields = jest.fn().mockResolvedValue({
        title: { type: "textarea" },
      });

      const context = contextWithRootResolver(mockResolveFields);

      useAppContextMock.mockReturnValue(context);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() => useResolvedFields());
      });

      const { result } = params;

      expect(result.current[0]).toEqual({ title: { type: "textarea" } });
      expect(result.current[1]).toBe(false);
      expect(mockResolveFields).toHaveBeenCalledTimes(1);
      expect(mockResolveFields).toHaveBeenCalledWith(
        {
          props: {},
          readOnly: {},
        },
        {
          appState: {
            data: { content: [], root: { props: {} } },
            ui: { itemSelector: null },
          },
          changed: {},
          fields: { title: { type: "text" } },
          lastData: {},
          lastFields: { title: { type: "text" } },
          parent: null,
        }
      );
    });

    it("defers state update when async", async () => {
      const mockResolveFields = jest.fn().mockResolvedValue({
        title: { type: "textarea" },
      });

      const context = contextWithRootResolver(async (...args: any) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(mockResolveFields(...args));
          }, 50);
        });
      });

      useAppContextMock.mockReturnValue(context);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() => useResolvedFields());
      });

      const { result } = params;

      expect(result.current[0]).toEqual({ title: { type: "text" } });
      expect(result.current[1]).toBe(true);

      await waitFor(() => {
        expect(result.current[0]).toEqual({ title: { type: "textarea" } });
        expect(result.current[1]).toBe(false);
        expect(mockResolveFields).toHaveBeenCalledTimes(1);
        expect(mockResolveFields).toHaveBeenCalledWith(
          {
            props: {},
            readOnly: {},
          },
          {
            appState: {
              data: { content: [], root: { props: {} } },
              ui: { itemSelector: null },
            },
            changed: {},
            fields: { title: { type: "text" } },
            lastData: {},
            lastFields: { title: { type: "text" } },
            parent: null,
          }
        );
      });
    });

    it("calls resolver with appropriate fields on props change", async () => {
      const mockResolveFields = jest.fn().mockResolvedValue({
        title: { type: "textarea" },
      });

      const context = contextWithRootResolver(mockResolveFields);

      useAppContextMock.mockReturnValue(context);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() => useResolvedFields());
      });

      // update state and trigger re-render
      useAppContextMock.mockReturnValue({
        ...context,
        state: {
          ...context.state,
          data: { ...context.state.data, root: { props: { foo: "bar" } } },
        },
      });

      await act(() => {
        params.rerender();
      });

      const { result } = params;

      expect(result.current[0]).toEqual({ title: { type: "textarea" } });
      expect(result.current[1]).toBe(false);
      expect(mockResolveFields).toHaveBeenCalledTimes(2);
      expect(mockResolveFields.mock.calls[1]).toEqual([
        { props: { foo: "bar" }, readOnly: {} },
        {
          appState: {
            data: { content: [], root: { props: { foo: "bar" } } }, // props changed
            ui: { itemSelector: null },
          },
          changed: { foo: true }, // track changed
          fields: { title: { type: "text" } },
          lastData: { props: {}, readOnly: {} },
          lastFields: { title: { type: "textarea" } }, // track previous fields due to re-render
          parent: null,
        },
      ]);
    });
  });

  describe("with resolveFields on a component", () => {
    it("calls the resolver immediately if a relevant item is preselected", async () => {
      const mockResolveFields = jest.fn().mockResolvedValue({
        title: { type: "textarea" },
      });

      const defaultContext = contextWithItemResolver(mockResolveFields);

      const context = {
        ...defaultContext,
        state: {
          ...defaultContext.state,
          ui: {
            ...defaultContext.state.ui,
            itemSelector: { zone: "default-zone", index: 0 },
          },
        },
        selectedItem: defaultContext.state.data.content[0],
      };

      useAppContextMock.mockReturnValue(context);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() => useResolvedFields());
      });

      const { result } = params;

      expect(result.current[0]).toEqual({ title: { type: "textarea" } });
      expect(result.current[1]).toBe(false);
      expect(mockResolveFields).toHaveBeenCalledTimes(1);
      expect(mockResolveFields).toHaveBeenCalledWith(
        { props: { id: "heading-1", title: "Hello, world" }, type: "Heading" },
        {
          appState: context.state,
          changed: { id: true, title: true },
          fields: { title: { type: "text" } },
          lastData: null,
          lastFields: { title: { type: "text" } },
          parent: null,
        }
      );
    });

    it("calls the resolver after a relevant item is selected", async () => {
      const mockResolveFields = jest.fn().mockResolvedValue({
        title: { type: "textarea" },
      });

      const defaultContext = contextWithItemResolver(mockResolveFields);

      useAppContextMock.mockReturnValue(defaultContext);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() => useResolvedFields());
      });

      const { result, rerender } = params;

      const context = {
        ...defaultContext,
        state: {
          ...defaultContext.state,
          ui: {
            ...defaultContext.state.ui,
            itemSelector: { zone: "default-zone", index: 0 },
          },
        },
        selectedItem: defaultContext.state.data.content[0],
      };

      useAppContextMock.mockReturnValue(context);

      await act(() => {
        rerender();
        rerender(); // Deliberately trigger a 2nd rerender to ensure we don't automatically re-run the resolver
      });

      expect(result.current[0]).toEqual({ title: { type: "textarea" } });
      expect(result.current[1]).toBe(false);
      expect(mockResolveFields).toHaveBeenCalledTimes(1);
      expect(mockResolveFields).toHaveBeenCalledWith(expect.any(Object), {
        appState: context.state,
        changed: { id: true, title: true },
        fields: { title: { type: "text" } },
        lastData: null,
        lastFields: { title: { type: "text" } },
        parent: null,
      });
    });
  });

  describe("with resolveFields on a component within a DropZone", () => {
    it("calls the resolver as soon as the item and parent are selected", async () => {
      const mockResolveFields = jest.fn().mockResolvedValue({
        title: { type: "textarea" },
      });

      const defaultContext = contextWithDropZoneItemResolver(mockResolveFields);

      useAppContextMock.mockReturnValue(defaultContext);
      useParentMock.mockReturnValue(null);

      await act(() => {
        params = renderHook(() => useResolvedFields());
      });

      expect(mockResolveFields).toHaveBeenCalledTimes(0);

      const context = {
        ...defaultContext,
        state: {
          ...defaultContext.state,
          ui: {
            ...defaultContext.state.ui,
            itemSelector: { zone: "flex-1:zone", index: 0 },
          },
        },
        selectedItem: defaultContext.state.data.zones?.["flex-1:zone"][0],
      };

      useAppContextMock.mockReturnValue(context);
      useParentMock.mockReturnValue(context.state.data.content[0]);

      await act(() => {
        params.rerender();
      });

      // Update values and render again to make sure resolver doesn't get called more than once
      useAppContextMock.mockReturnValue({ ...context });
      useParentMock.mockReturnValue({ ...context.state.data.content[0] });

      await act(() => {
        params.rerender();
      });

      const { result } = params;

      expect(result.current[0]).toEqual({ title: { type: "textarea" } });
      expect(result.current[1]).toBe(false);
      expect(mockResolveFields).toHaveBeenCalledTimes(1);
      expect(mockResolveFields).toHaveBeenCalledWith(
        { props: { id: "heading-1", title: "Hello, world" }, type: "Heading" },
        {
          appState: context.state,
          changed: { id: true, title: true },
          fields: { title: { type: "text" } },
          lastData: null,
          lastFields: { title: { type: "text" } },
          parent: context.state.data.content[0],
        }
      );
    });
  });
});
