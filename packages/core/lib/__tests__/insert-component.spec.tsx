import { cleanup } from "@testing-library/react";
import { AppState, Config, Data } from "../../types";
import { PuckAction } from "../../reducer";
import { defaultAppState } from "../../components/Puck/context";
import { insertComponent } from "../insert-component";
import { rootDroppableId } from "../root-droppable-id";

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

describe("use-insert-component", () => {
  describe("insert-component", () => {
    let dispatchedEvents: PuckAction[] = [];
    let resolvedDataEvents: AppState[] = [];

    const ctx = {
      config,
      dispatch: (action: PuckAction) => {
        dispatchedEvents.push(action);
      },
      resolveData: (appState: AppState) => {
        resolvedDataEvents.push(appState);
      },
      state,
    };

    afterEach(() => {
      cleanup();
      dispatchedEvents = [];
      resolvedDataEvents = [];
    });

    it("should dispatch the insert action", async () => {
      insertComponent("MyComponent", rootDroppableId, 0, ctx);

      expect(dispatchedEvents[0]).toEqual<PuckAction>({
        type: "insert",
        componentType: "MyComponent",
        destinationZone: rootDroppableId,
        destinationIndex: 0,
        id: expect.stringContaining("MyComponent-"),
        recordHistory: true,
      });
    });

    it("should dispatch the setUi action, and select the item", async () => {
      insertComponent("MyComponent", rootDroppableId, 0, ctx);

      expect(dispatchedEvents[1]).toEqual<PuckAction>({
        type: "setUi",
        ui: {
          itemSelector: {
            zone: rootDroppableId,
            index: 0,
          },
        },
      });
    });

    it("should run any resolveData methods on the inserted item", async () => {
      insertComponent("MyComponent", rootDroppableId, 0, ctx);

      expect(resolvedDataEvents[0]).toEqual<AppState>({
        ...state,
        data: {
          ...state.data,
          content: [
            {
              type: "MyComponent",
              props: {
                id: expect.stringContaining("MyComponent-"),
                prop: "example",
              },
            },
            ...state.data.content,
          ],
        },
        ui: {
          ...state.ui,
          itemSelector: {
            index: 0,
            zone: rootDroppableId,
          },
        },
      });
    });
  });
});
