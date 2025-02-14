import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { AppState, Config, Data, MetaData } from "../../types";
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

const metadata: MetaData = {
  "title": "Hello, Metadata!"
}

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
      resolveData: ({ props }, { metadata }) => {
        return {
          props: {
            ...props,
            prop: metadata.title || "Hello, world",
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

describe("use-metadata", () => {
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
          () => { },
          () => { },
          () => { },
          metadata
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
                  "prop": "Hello, Metadata!",
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
                    "prop": "Hello, Metadata!",
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
                    "prop": "Hello, Metadata!",
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
            "field": {
              "focus": null,
            },
            "isDragging": false,
            "itemSelector": null,
            "leftSideBarVisible": true,
            "previewMode": "edit",
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
  });
});
