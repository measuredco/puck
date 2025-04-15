import {
  DuplicateAction,
  InsertAction,
  MoveAction,
  PuckAction,
  RegisterZoneAction,
  RemoveAction,
  ReorderAction,
  ReplaceAction,
  SetDataAction,
  SetUiAction,
  UnregisterZoneAction,
  createReducer,
} from "../../reducer";
import { ComponentData, Config, Data, Slot, UiState } from "../../types";
import { rootDroppableId } from "../../lib/root-droppable-id";

import { generateId } from "../../lib/generate-id";
import {
  createAppStore,
  defaultAppState as _defaultAppState,
} from "../../store";
import { PrivateAppState } from "../../types/Internal";
import { stripSlots } from "../../lib/strip-slots";

jest.mock("../../lib/generate-id");

const mockedGenerateId = generateId as jest.MockedFunction<typeof generateId>;

type Props = {
  Comp: {
    prop: string;
    slot: Slot;
  };
};

type RootProps = {
  title: string;
  slot: Slot;
};

type UserConfig = Config<Props, RootProps>;
type UserData = Data<Props, RootProps>;

const dzZoneCompound = "my-component:zone1";

const defaultData: UserData = {
  root: { props: { title: "", slot: [] } },
  content: [],
  zones: { [dzZoneCompound]: [] },
};

const defaultUi: UiState = _defaultAppState.ui;

const defaultIndexes: PrivateAppState<UserData>["indexes"] = {
  nodes: {},
  zones: {
    "root:slot": { contentIds: [], type: "slot" },
    [dzZoneCompound]: { contentIds: [], type: "dropzone" },
  },
};

const defaultState = {
  data: defaultData,
  ui: defaultUi,
  indexes: defaultIndexes,
};

const appStore = createAppStore();

const expectIndexed = (
  state: PrivateAppState,
  item: ComponentData | undefined,
  path: string[],
  index: number
) => {
  if (!item) return;

  const zoneCompound = path[path.length - 1];

  expect(state.indexes.zones[zoneCompound].contentIds[index]).toEqual(
    item.props.id
  );
  expect(state.indexes.nodes[item.props.id].data).toEqual(item);
  expect(state.indexes.nodes[item.props.id].flatData).toEqual(stripSlots(item));
  expect(state.indexes.nodes[item.props.id].path).toEqual(path);
};

describe("Reducer", () => {
  const config: UserConfig = {
    root: {
      fields: { title: { type: "text" }, slot: { type: "slot" } },
    },
    components: {
      Comp: {
        fields: {
          prop: { type: "text" },
          slot: { type: "slot" },
        },
        defaultProps: { prop: "example", slot: [] },
        render: () => <div />,
      },
    },
  };

  let reducer = createReducer({ appStore: appStore.getState() });

  beforeEach(() => {
    appStore.setState(
      {
        ...appStore.getInitialState(),
        config,
      },
      true
    );

    reducer = createReducer({ appStore: appStore.getState() });

    let counter = 0;

    mockedGenerateId.mockImplementation(() => `mockId-${counter++}`);
  });

  const executeSequence = (
    initialState: PrivateAppState<UserData>,
    actions: ((currentState: PrivateAppState<UserData>) => PuckAction)[]
  ) => {
    let currentState: PrivateAppState<UserData> = initialState;

    actions.forEach((actionFn) => {
      const action = actionFn(currentState);

      currentState = reducer(currentState, action) as PrivateAppState<UserData>;
    });

    return currentState;
  };

  describe.only("insert action", () => {
    describe("with DropZones", () => {
      it("should insert into rootDroppableId", () => {
        const action: InsertAction = {
          type: "insert",
          componentType: "Comp",
          destinationIndex: 0,
          destinationZone: rootDroppableId,
        };

        const newState = reducer(defaultState, action);
        const item = newState.data.content[0];

        expect(item).toHaveProperty("type", "Comp");
        expect(item.props).toHaveProperty("prop", "example");
        expectIndexed(newState, item, [rootDroppableId], 0);
      });

      it("should insert into a different zone", () => {
        const action: InsertAction = {
          type: "insert",
          componentType: "Comp",
          destinationIndex: 0,
          destinationZone: dzZoneCompound,
        };

        const state = reducer(defaultState, action);

        const item = state.data.zones?.[dzZoneCompound][0];

        expect(item).toHaveProperty("type", "Comp");
        expect(item?.props).toHaveProperty("prop", "example");
        expectIndexed(state, item, [rootDroppableId, dzZoneCompound], 0);
      });
    });

    describe("with slots", () => {
      it("should insert into a root slot", () => {
        const state: PrivateAppState<UserData> = defaultState;

        const action: InsertAction = {
          type: "insert",
          componentType: "Comp",
          destinationIndex: 0,
          destinationZone: "root:slot",
        };

        const newState = reducer(state, action) as PrivateAppState<UserData>;

        const item = newState.data.root.props?.slot[0];

        expect(item).toHaveProperty("type", "Comp");
        expect(item?.props).toHaveProperty("prop", "example");
        expectIndexed(newState, item, ["root:slot"], 0);
      });

      it("should insert into a slot within a slot", () => {
        const state = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationIndex: 0,
            destinationZone: "root:slot",
          }),
          (state) => ({
            type: "insert",
            componentType: "Comp",
            destinationIndex: 0,
            destinationZone: `${state.data.root.props?.slot[0].props?.id}:slot`,
          }),
        ]);

        const item = state.data.root.props?.slot[0]?.props.slot[0];

        expect(item).toHaveProperty("type", "Comp");
        expect(item?.props).toHaveProperty("prop", "example");
        expectIndexed(
          state,
          item,
          ["root:slot", `${state.data.root.props?.slot[0].props?.id}:slot`],
          0
        );
      });

      it("should insert into a slot within a DropZone", () => {
        const state = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationIndex: 0,
            destinationZone: dzZoneCompound,
          }),
          (state) => ({
            type: "insert",
            componentType: "Comp",
            destinationIndex: 0,
            destinationZone: `${state.data.zones?.[dzZoneCompound][0]?.props.id}:slot`,
          }),
        ]);

        const item = state.data.zones?.[dzZoneCompound][0];

        expect(item).toHaveProperty("type", "Comp");
        expect(item?.props).toHaveProperty("prop", "example");
        expectIndexed(state, item, [rootDroppableId, dzZoneCompound], 0);
      });
    });
  });

  describe("reorder action", () => {
    it("should reorder within rootDroppableId", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [
            { type: "Comp", props: { id: "1" } },
            { type: "Comp", props: { id: "2" } },
          ],
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: ReorderAction = {
        type: "reorder",
        sourceIndex: 0,
        destinationIndex: 1,
        destinationZone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.data.content[0].props.id).toBe("2");
      expect(newState.data.content[1].props.id).toBe("1");
    });

    it("should reorder within a different zone", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: {
            zone1: [
              { type: "A", props: { id: "1" } },
              { type: "B", props: { id: "2" } },
            ],
          },
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: ReorderAction = {
        type: "reorder",
        sourceIndex: 0,
        destinationIndex: 1,
        destinationZone: "zone1",
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1[0].props.id).toBe("2");
      expect(newState.data.zones?.zone1[1].props.id).toBe("1");
    });
  });

  describe("duplicate action", () => {
    it("should duplicate in content", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [
            {
              type: "Comp",
              props: { id: "sampleId", prop: "Some example data" },
            },
          ],
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: DuplicateAction = {
        type: "duplicate",
        sourceIndex: 0,
        sourceZone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.data.content).toHaveLength(2);
      expect(newState.data.content[1].props.id).not.toBe("sampleId");
      expect(newState.data.content[1].props.prop).toBe("Some example data");
    });

    it("should duplicate in a different zone", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: {
            zone1: [
              {
                type: "Comp",
                props: { id: "sampleId", prop: "Some example data" },
              },
            ],
          },
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: DuplicateAction = {
        type: "duplicate",
        sourceIndex: 0,
        sourceZone: "zone1",
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1).toHaveLength(2);
      expect(newState.data.zones?.zone1[1].props.id).not.toBe("sampleId");
      expect(newState.data.zones?.zone1[1].props.prop).toBe(
        "Some example data"
      );
    });

    it("should recursively duplicate items", () => {
      let counter = 0;

      mockedGenerateId.mockImplementation(() => `mockId-${counter++}`);

      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: {
            zone1: [
              {
                type: "Comp",
                props: { id: "mycomponent", prop: "Some example data" },
              },
            ],
            "mycomponent:zone1": [
              {
                type: "Comp",
                props: { id: "sampleId", prop: "More example data" },
              },
            ],
          },
        },
        indexes: { nodes: {}, zones: {} },
      };

      const action: DuplicateAction = {
        type: "duplicate",
        sourceIndex: 0,
        sourceZone: "zone1",
      };

      const newState = reducer(state, action);

      expect(newState.data).toMatchInlineSnapshot(`
        {
          "content": [],
          "root": {
            "props": {
              "title": "",
            },
          },
          "zones": {
            "mockId-0:zone1": [
              {
                "props": {
                  "id": "mockId-1",
                  "prop": "More example data",
                },
                "type": "Comp",
              },
            ],
            "mycomponent:zone1": [
              {
                "props": {
                  "id": "sampleId",
                  "prop": "More example data",
                },
                "type": "Comp",
              },
            ],
            "zone1": [
              {
                "props": {
                  "id": "mycomponent",
                  "prop": "Some example data",
                },
                "type": "Comp",
              },
              {
                "props": {
                  "id": "mockId-0",
                  "prop": "Some example data",
                },
                "type": "Comp",
              },
            ],
          },
        }
      `);
    });

    it("should select the duplicated item", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [
            {
              type: "Comp",
              props: { id: "sampleId", prop: "Some example data" },
            },
          ],
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: DuplicateAction = {
        type: "duplicate",
        sourceIndex: 0,
        sourceZone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.ui.itemSelector?.index).toBe(1);
      expect(newState.ui.itemSelector?.zone).toBe(rootDroppableId);
    });
  });

  describe("move action", () => {
    it("should move from rootDroppableId to another zone", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
          zones: { zone1: [{ type: "Comp", props: { id: "2" } }] },
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: MoveAction = {
        type: "move",
        sourceIndex: 0,
        sourceZone: rootDroppableId,
        destinationIndex: 1,
        destinationZone: "zone1",
      };

      const newState = reducer(state, action);
      expect(newState.data.content).toHaveLength(0);
      expect(newState.data.zones?.zone1[1].props.id).toBe("1");
    });

    it("should move from a zone to rootDroppableId", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
          zones: { zone1: [{ type: "Comp", props: { id: "2" } }] },
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: MoveAction = {
        type: "move",
        sourceIndex: 0,
        sourceZone: "zone1",
        destinationIndex: 1,
        destinationZone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1).toHaveLength(0);
      expect(newState.data.content[1].props.id).toBe("2");
    });

    it("should move between two zones", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [],
          zones: {
            zone1: [{ type: "Comp", props: { id: "1" } }],
            zone2: [{ type: "Comp", props: { id: "2" } }],
          },
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: MoveAction = {
        type: "move",
        sourceIndex: 0,
        sourceZone: "zone1",
        destinationIndex: 0, // Go to the start, this time
        destinationZone: "zone2",
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1).toHaveLength(0);
      expect(newState.data.zones?.zone2[0].props.id).toBe("1");
    });
  });

  describe("replace action", () => {
    const replacement = { type: "Comp", props: { id: "3" } };

    it("should replace in content", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: ReplaceAction = {
        type: "replace",
        destinationIndex: 0,
        destinationZone: rootDroppableId,
        data: replacement,
      };

      const newState = reducer(state, action);
      expect(newState.data.content.length).toBe(1);
      expect(newState.data.content[0].props.id).toBe("3");
    });

    it("should replace in a zone", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: ReplaceAction = {
        type: "replace",
        destinationIndex: 0,
        destinationZone: "zone1",
        data: replacement,
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1.length).toBe(1);
      expect(newState.data.zones?.zone1[0].props.id).toBe("3");
    });
  });

  describe("remove action", () => {
    it("should remove from content", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: RemoveAction = {
        type: "remove",
        index: 0,
        zone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.data.content).toHaveLength(0);
    });

    it("should remove from a zone", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: RemoveAction = {
        type: "remove",
        index: 0,
        zone: "zone1",
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1).toHaveLength(0);
    });

    it("should recursively remove items", () => {
      let counter = 0;

      mockedGenerateId.mockImplementation(() => `mockId-${counter++}`);

      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: {
            zone1: [
              {
                type: "Comp",
                props: { id: "mycomponent", prop: "Some example data" },
              },
            ],
            "mycomponent:zone1": [
              {
                type: "Comp",
                props: { id: "sampleId", prop: "More example data" },
              },
            ],
          },
        },
        indexes: { nodes: {}, zones: {} },
      };

      const action: RemoveAction = {
        type: "remove",
        index: 0,
        zone: "zone1",
      };

      const newState = reducer(state, action);

      expect(newState.data).toMatchInlineSnapshot(`
        {
          "content": [],
          "root": {
            "props": {
              "title": "",
            },
          },
          "zones": {
            "zone1": [],
          },
        }
      `);
    });

    it("should deselect the item", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [
            {
              type: "Comp",
              props: { id: "sampleId", prop: "Some example data" },
            },
          ],
        },
        indexes: { nodes: {}, zones: {} },
      };
      const action: RemoveAction = {
        type: "remove",
        index: 0,
        zone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.ui.itemSelector).toBeNull();
    });
  });

  describe("unregisterZone action", () => {
    it("should unregister a zone", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
        indexes: { nodes: {}, zones: {} },
      };

      const action: UnregisterZoneAction = {
        type: "unregisterZone",
        zone: "zone1",
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1).toBeUndefined();
    });
  });

  describe("registerZone action", () => {
    it("should register a zone that's been previously unregistered", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
        indexes: { nodes: {}, zones: {} },
      };

      const unregisterAction: UnregisterZoneAction = {
        type: "unregisterZone",
        zone: "zone1",
      };

      const registerAction: RegisterZoneAction = {
        type: "registerZone",
        zone: "zone1",
      };

      const newState = reducer(
        reducer(state, unregisterAction),
        registerAction
      );
      expect(newState.data.zones?.zone1[0].props.id).toEqual("1");
    });
  });

  describe("set action", () => {
    it("should set new data", () => {
      const state: PrivateAppState = {
        ui: defaultUi,
        data: { ...defaultData },
        indexes: { nodes: {}, zones: {} },
      };
      const newData: Data = {
        ...defaultData,
        root: { props: { title: "Hello, world" } },
        content: [{ type: "Comp", props: { id: "1" } }],
      };

      const action: SetDataAction = {
        type: "setData",
        data: newData,
      };

      const newState = reducer(state, action);
      expect(newState.data).toEqual(newData);
    });
  });

  describe("setUi action", () => {
    it("should insert data into the state", () => {
      const state: PrivateAppState = defaultState;

      const action: SetUiAction = {
        type: "setUi",
        ui: { leftSideBarVisible: false },
      };

      const newState = reducer(state, action);
      expect(newState.ui.leftSideBarVisible).toEqual(false);
    });
  });
});
