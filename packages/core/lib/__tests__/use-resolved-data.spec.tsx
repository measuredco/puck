import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { AppState, Config, Data } from "../../types";
import { useResolvedData } from "../use-resolved-data";
import { SetAction, SetDataAction } from "../../reducer";
import { cache } from "../resolve-component-data";
import { defaultAppState } from "../../components/Puck/context";
import { RefreshPermissions } from "../use-resolved-permissions";

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

const state: AppState = {
  data,
  ui: defaultAppState.ui,
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

    it("should call the `set` action with resolved data", async () => {
      let dispatchedEvents: SetAction[] = [];
      let currentState: AppState = state;

      const renderedHook = renderHook(() => {
        return useResolvedData(
          currentState,
          config,
          (args) => {
            const action = args as SetAction;
            const newState = action.state as any;

            dispatchedEvents.push(action);

            currentState = { ...currentState, ...newState(currentState) };
          },
          () => {},
          () => {},
          () => {}
        );
      });

      await act(async () => {
        // resolveData gets called on render
        renderedHook.rerender();
      });

      expect(dispatchedEvents.length).toBe(4); // calls dispatcher for each resolver

      expect(currentState).toMatchInlineSnapshot(`
        {
          "data": {
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
          },
          "ui": {
            "arrayState": {},
            "componentList": {},
            "isDragging": false,
            "itemSelector": null,
            "leftSideBarVisible": true,
            "rightSideBarVisible": true,
            "viewports": {
              "controlsVisible": true,
              "current": {
                "height": "auto",
                "width": 360,
              },
              "options": [],
            },
          },
        }
      `);
    });

    it("should NOT set the UI on the first resolveData call", async () => {
      let dispatchedEvents: SetAction[] = [];
      let currentState: AppState = state;

      const renderedHook = renderHook(() => {
        return useResolvedData(
          {
            ...currentState,
            ui: { ...currentState.ui, leftSideBarVisible: false },
          },
          config,
          (args) => {
            const action = args as SetAction;
            const newState = action.state as any;

            dispatchedEvents.push(action);

            currentState = { ...currentState, ...newState(currentState) };
          },
          () => {},
          () => {},
          () => {}
        );
      });

      await act(async () => {
        // resolveData gets called on render
        renderedHook.rerender();
      });

      expect(dispatchedEvents.length).toBe(4); // calls dispatcher for each resolver

      expect(currentState.ui.leftSideBarVisible).toBe(true);
    });

    it("should set the UI on subsequent resolveData calls", async () => {
      let dispatchedEvents: SetAction[] = [];
      let currentState: AppState = state;

      const hookArgs: any = [
        currentState,
        config,
        (args: any) => {
          const action = args as SetAction;
          const newState = action.state as any;

          dispatchedEvents.push(action);
          currentState = { ...currentState, ...newState(currentState) };
        },
      ];

      const renderedHook = renderHook(() =>
        useResolvedData(
          hookArgs[0],
          hookArgs[1],
          hookArgs[2],
          () => {},
          () => {},
          () => {}
        )
      );

      await act(async () => {
        // resolveData gets called on render
        renderedHook.rerender(() =>
          useResolvedData(
            hookArgs[0],
            hookArgs[1],
            hookArgs[2],
            () => {},
            () => {},
            () => {}
          )
        );

        renderedHook.result.current.resolveData({
          ...currentState,
          ui: { ...currentState.ui, leftSideBarVisible: false },
        });

        renderedHook.rerender(() =>
          useResolvedData(
            hookArgs[0],
            hookArgs[1],
            hookArgs[2],
            () => {},
            () => {},
            () => {}
          )
        );
      });

      expect(currentState.ui.leftSideBarVisible).toBe(false);
    });

    it("should NOT call the `setData` action with resolved data, when the data is unchanged", async () => {
      let dispatchedEvent: SetDataAction = {} as any;

      const renderedHook = renderHook(() =>
        useResolvedData(
          state,
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
          },
          () => {},
          () => {},
          () => {}
        )
      );

      const { resolveData } = renderedHook.result.current;

      await act(async () => {
        resolveData();
      });

      expect(dispatchedEvent).toEqual({});
    });

    it("should call componentLoading callbacks to reflect which components are loading", async () => {
      let dispatchedEvent: SetDataAction = {} as any;

      const loadingState: Record<string, boolean> = {};
      const setComponentLoading = (id: string) => {
        loadingState[id] = true;
      };
      const unsetComponentLoading = (id: string) => {
        loadingState[id] = false;
      };

      const renderedHook = renderHook(() =>
        useResolvedData(
          state,
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
          },
          setComponentLoading,
          unsetComponentLoading,
          () => {}
        )
      );

      await act(async () => {
        renderedHook.result.current.resolveData();
      });

      await waitFor(() => expect(loadingState["MyComponent-1"]).toBe(false));

      renderedHook.rerender();

      await waitFor(() => expect(loadingState["MyComponent-1"]).toBe(false));
    });

    it("should call refreshPermission callback when loading an item", async () => {
      let dispatchedEvent: SetDataAction = {} as any;

      const calledFor: string[] = [];
      const refreshPermissions: RefreshPermissions = ({ item } = {}) => {
        calledFor.push(item?.props.id);
      };

      const renderedHook = renderHook(() =>
        useResolvedData(
          state,
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
          },
          () => {},
          () => {},
          refreshPermissions
        )
      );

      await act(async () => {
        renderedHook.result.current.resolveData();
      });

      await waitFor(() => expect(calledFor[0]).toBe("MyComponent-1"));
    });
  });
});
