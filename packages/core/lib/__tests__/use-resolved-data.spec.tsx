import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { Config, Data } from "../../types/Config";
import { useResolvedData } from "../use-resolved-data";
import { SetDataAction } from "../../reducer";
import { cache } from "../resolve-component-data";

const item1 = { type: "MyComponent", props: { id: "MyComponent-1" } };
const item2 = { type: "MyComponent", props: { id: "MyComponent-2" } };
const item3 = { type: "MyComponent", props: { id: "MyComponent-3" } };

const data: Data = {
  root: { props: { title: "" } },
  content: [item1],
  zones: {
    "MyComponent-1:zone": [item2],
    "MyComponent-2:zone": [item3],
  },
};

const config: Config = {
  root: {
    resolveData: (data) => {
      return {
        ...data,
        props: { title: "Resolved title" },
        readOnly: { title: true },
      };
    },
  },
  components: {
    MyComponent: {
      defaultProps: { prop: "example" },
      resolveData: ({ props }) => {
        return {
          props: {
            ...props,
            prop: "Hello, world",
          },
          readOnly: {
            prop: true,
          },
        };
      },
      render: () => <div />,
    },
  },
};

describe("use-resolved-data", () => {
  describe("resolveData method", () => {
    afterEach(() => {
      cleanup();

      cache.lastChange = {};
    });

    it("should call the `setData` action with resolved data", async () => {
      let dispatchedEvents: SetDataAction[] = [];
      let currentData = data;

      const renderedHook = renderHook(() => {
        return useResolvedData(currentData, config, (args) => {
          const action = args as SetDataAction;
          const newData = action.data as any;

          dispatchedEvents.push(action);

          currentData = { ...currentData, ...newData(currentData) };
        });
      });

      await act(async () => {
        // resolveData gets called on render
        renderedHook.rerender();
      });

      expect(dispatchedEvents.length).toBe(4); // calls dispatcher for each resolver

      const fn = dispatchedEvents[dispatchedEvents.length - 1].data as any;
      expect(currentData).toMatchInlineSnapshot(`
        {
          "content": [
            {
              "props": {
                "id": "MyComponent-1",
                "prop": "Hello, world",
              },
              "readOnly": {
                "prop": true,
              },
              "type": "MyComponent",
            },
          ],
          "root": {
            "props": {
              "title": "Resolved title",
            },
            "readOnly": {
              "title": true,
            },
          },
          "zones": {
            "MyComponent-1:zone": [
              {
                "props": {
                  "id": "MyComponent-2",
                  "prop": "Hello, world",
                },
                "readOnly": {
                  "prop": true,
                },
                "type": "MyComponent",
              },
            ],
            "MyComponent-2:zone": [
              {
                "props": {
                  "id": "MyComponent-3",
                  "prop": "Hello, world",
                },
                "readOnly": {
                  "prop": true,
                },
                "type": "MyComponent",
              },
            ],
          },
        }
      `);
    });

    it("should NOT call the `setData` action with resolved data, when the data is unchanged", async () => {
      let dispatchedEvent: SetDataAction = {} as any;

      const renderedHook = renderHook(() =>
        useResolvedData(
          data,
          {
            ...config,
            root: {},
            components: {
              ...config.components,
              MyComponent: {
                ...config.components.MyComponent,
                resolveData: ({ props }) => ({ props }),
              },
            },
          },
          (args) => {
            dispatchedEvent = args as any;
          }
        )
      );

      const { resolveData } = renderedHook.result.current;

      await act(async () => {
        resolveData();
      });

      expect(dispatchedEvent).toEqual({});
    });
  });

  describe("componentState", () => {
    it("should state which components are loading", async () => {
      let dispatchedEvent: SetDataAction = {} as any;

      const renderedHook = renderHook(() =>
        useResolvedData(
          data,
          {
            ...config,
            components: {
              ...config.components,
              MyComponent: {
                ...config.components.MyComponent,
                resolveData: async ({ props }) => {
                  await new Promise<void>((resolve) => setTimeout(resolve, 10));
                  return { props };
                },
              },
            },
          },
          (args) => {
            dispatchedEvent = args as any;
          }
        )
      );

      await act(async () => {
        renderedHook.result.current.resolveData();
      });

      await waitFor(() =>
        expect(
          renderedHook.result.current.componentState["MyComponent-1"].loading
        ).toBe(false)
      );

      renderedHook.rerender();

      await waitFor(() =>
        expect(
          renderedHook.result.current.componentState["MyComponent-1"].loading
        ).toBe(false)
      );
    });
  });
});
