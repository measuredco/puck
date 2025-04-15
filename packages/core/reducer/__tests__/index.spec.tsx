import {
  InsertAction,
  MoveAction,
  PuckAction,
  RegisterZoneAction,
  RemoveAction,
  ReplaceAction,
  SetDataAction,
  SetUiAction,
  UnregisterZoneAction,
  createReducer,
} from "../../reducer";
import {
  ComponentData,
  Config,
  Content,
  Data,
  Slot,
  UiState,
} from "../../types";
import { rootDroppableId } from "../../lib/root-droppable-id";

import { generateId } from "../../lib/generate-id";
import {
  createAppStore,
  defaultAppState as _defaultAppState,
} from "../../store";
import { PrivateAppState } from "../../types/Internal";
import { stripSlots } from "../../lib/strip-slots";
import { walkTree } from "../../lib/walk-tree";

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

type UserAppState = PrivateAppState<UserData>;

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

  describe("insert action", () => {
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
    describe("with DropZones", () => {
      it("should reorder within rootDroppableId", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: rootDroppableId,
            destinationIndex: 0,
            id: "1",
          }),
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: rootDroppableId,
            destinationIndex: 1,
            id: "2",
          }),
          () => ({
            type: "reorder",
            sourceIndex: 0,
            destinationIndex: 1,
            destinationZone: rootDroppableId,
          }),
        ]);

        expect(newState.data.content[0].props.id).toBe("2");
        expect(newState.data.content[1].props.id).toBe("1");
        expectIndexed(newState, newState.data.content[0], [rootDroppableId], 0);
        expectIndexed(newState, newState.data.content[1], [rootDroppableId], 1);
      });

      it("should reorder within a different zone", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: dzZoneCompound,
            destinationIndex: 0,
            id: "1",
          }),
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: dzZoneCompound,
            destinationIndex: 1,
            id: "2",
          }),
          () => ({
            type: "reorder",
            sourceIndex: 0,
            destinationIndex: 1,
            destinationZone: dzZoneCompound,
          }),
        ]);

        expect(newState.data.zones?.[dzZoneCompound][0].props.id).toBe("2");
        expect(newState.data.zones?.[dzZoneCompound][1].props.id).toBe("1");
        expectIndexed(
          newState,
          newState.data.content[0],
          [rootDroppableId, dzZoneCompound],
          0
        );
        expectIndexed(
          newState,
          newState.data.content[1],
          [rootDroppableId, dzZoneCompound],
          1
        );
      });
    });

    describe("with slots", () => {
      it("should reorder within a slot", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "root:slot",
            destinationIndex: 0,
            id: "1",
          }),
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "root:slot",
            destinationIndex: 1,
            id: "2",
          }),
          () => ({
            type: "reorder",
            sourceIndex: 0,
            destinationIndex: 1,
            destinationZone: "root:slot",
          }),
        ]);

        expect(newState.data.root.props?.slot[0].props.id).toBe("2");
        expect(newState.data.root.props?.slot[1].props.id).toBe("1");
        expectIndexed(
          newState,
          newState.data.root.props?.slot[0],
          ["root:slot"],
          0
        );
        expectIndexed(
          newState,
          newState.data.root.props?.slot[1],
          ["root:slot"],
          1
        );
      });
    });
  });

  describe("duplicate action", () => {
    describe("with DropZones", () => {
      it("should duplicate in content", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: rootDroppableId,
            destinationIndex: 0,
            id: "sampleId",
          }),
          (state) => ({
            type: "replace",
            destinationZone: rootDroppableId,
            destinationIndex: 0,
            data: {
              ...state.indexes.nodes["sampleId"].data,
              props: {
                ...state.indexes.nodes["sampleId"].data.props,
                prop: "Some example data",
              },
            },
          }),
          () => ({
            type: "duplicate",
            sourceZone: rootDroppableId,
            sourceIndex: 0,
          }),
        ]);

        expect(newState.data.content).toHaveLength(2);
        expect(newState.data.content[1].props.id).not.toBe("sampleId");
        expect(newState.data.content[1].props.prop).toBe("Some example data");
        expectIndexed(newState, newState.data.content[1], [rootDroppableId], 1);
      });

      it("should duplicate in a different zone", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: dzZoneCompound,
            destinationIndex: 0,
            id: "sampleId",
          }),
          (state) => ({
            type: "replace",
            destinationZone: dzZoneCompound,
            destinationIndex: 0,
            data: {
              ...state.indexes.nodes["sampleId"].data,
              props: {
                ...state.indexes.nodes["sampleId"].data.props,
                prop: "Some example data",
              },
            },
          }),
          () => ({
            type: "duplicate",
            sourceZone: dzZoneCompound,
            sourceIndex: 0,
          }),
        ]);

        const zone = newState.data.zones?.[dzZoneCompound] ?? [];

        expect(zone).toHaveLength(2);
        expect(zone[1].props.id).not.toBe("sampleId");
        expect(zone[1].props.prop).toBe("Some example data");
        expectIndexed(newState, zone[1], [rootDroppableId, dzZoneCompound], 1);
      });

      it("should recursively duplicate related items and zones", () => {
        const state: PrivateAppState = walkTree(
          {
            ...defaultState,
            data: {
              ...defaultData,
              content: [
                {
                  type: "Comp",
                  props: { id: "my-component", prop: "Data" },
                },
              ],
              zones: {
                "my-component:zone": [
                  {
                    type: "Comp",
                    props: { id: "other-component", prop: "More example data" },
                  },
                ],
                "other-component:zone": [
                  {
                    type: "Comp",
                    props: { id: "final-id", prop: "Even more example data" },
                  },
                ],
              },
            },
          },
          config
        );

        const newState = reducer(state, {
          type: "duplicate",
          sourceIndex: 0,
          sourceZone: rootDroppableId,
        });

        const zone1 = newState.data.content ?? [];

        expect(zone1).toHaveLength(2);
        expect(zone1[1].props.id).not.toBe("my-component");
        expect(zone1[1].props.prop).toBe("Data");
        expectIndexed(newState, zone1[1], [rootDroppableId], 1);

        const zone2ZoneCompound = `${zone1[1].props.id}:zone`;
        const zone2 = newState.data.zones?.[zone2ZoneCompound] ?? [];

        expect(zone2).toHaveLength(1);
        expect(zone2[0].props.id).not.toBe("other-component");
        expect(zone2[0].props.prop).toBe("More example data");
        expectIndexed(
          newState,
          zone2[0],
          [rootDroppableId, zone2ZoneCompound],
          0
        );

        const zone3ZoneCompound = `${zone2[0].props.id}:zone`;
        const zone3 = newState.data.zones?.[zone3ZoneCompound] ?? [];

        expect(zone3).toHaveLength(1);
        expect(zone3[0].props.id).not.toBe("final-id");
        expect(zone3[0].props.prop).toBe("Even more example data");
        expectIndexed(
          newState,
          zone3[0],
          [rootDroppableId, zone2ZoneCompound, zone3ZoneCompound],
          0
        );
      });

      it("should select the duplicated item", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: rootDroppableId,
            destinationIndex: 0,
            id: "sampleId",
          }),
          () => ({
            type: "duplicate",
            sourceZone: rootDroppableId,
            sourceIndex: 0,
          }),
        ]);

        expect(newState.ui.itemSelector?.index).toBe(1);
        expect(newState.ui.itemSelector?.zone).toBe(rootDroppableId);
      });
    });
    describe("with slots", () => {
      it("should duplicate within a slot", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "root:slot",
            destinationIndex: 0,
            id: "sampleId",
          }),
          (state) => ({
            type: "replace",
            destinationZone: "root:slot",
            destinationIndex: 0,
            data: {
              ...state.indexes.nodes["sampleId"].data,
              props: {
                ...state.indexes.nodes["sampleId"].data.props,
                prop: "Some example data",
              },
            },
          }),
          () => ({
            type: "duplicate",
            sourceZone: "root:slot",
            sourceIndex: 0,
          }),
        ]);

        const content = newState.data.root.props?.slot ?? [];
        expect(content).toHaveLength(2);
        expect(content[1].props.id).not.toBe("sampleId");
        expect(content[1].props.prop).toBe("Some example data");
        expectIndexed(newState, content[1], ["root:slot"], 1);
      });

      it("should duplicate within a slot, within a slot", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "root:slot",
            destinationIndex: 0,
            id: "first",
          }),
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "first:slot",
            destinationIndex: 0,
            id: "second",
          }),
          (state) => ({
            type: "replace",
            destinationZone: "first:slot",
            destinationIndex: 0,
            data: {
              ...state.indexes.nodes["second"].data,
              props: {
                ...state.indexes.nodes["second"].data.props,
                prop: "Some example data",
              },
            },
          }),
          () => ({
            type: "duplicate",
            sourceZone: "first:slot",
            sourceIndex: 0,
          }),
        ]);

        const content = (newState.data.root.props?.slot ?? [])[0].props
          .slot as Content;
        expect(content).toHaveLength(2);
        expect(content[1].props.id).not.toBe("second");
        expect(content[1].props.prop).toBe("Some example data");
        expectIndexed(newState, content[1], ["root:slot", "first:slot"], 1);
      });

      it("should duplicate within a slot, within a DropZone", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: dzZoneCompound,
            destinationIndex: 0,
            id: "first",
          }),
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "first:slot",
            destinationIndex: 0,
            id: "second",
          }),
          (state) => ({
            type: "replace",
            destinationZone: "first:slot",
            destinationIndex: 0,
            data: {
              ...state.indexes.nodes["second"].data,
              props: {
                ...state.indexes.nodes["second"].data.props,
                prop: "Some example data",
              },
            },
          }),
          () => ({
            type: "duplicate",
            sourceZone: "first:slot",
            sourceIndex: 0,
          }),
        ]);

        const content =
          newState.data.zones?.[dzZoneCompound][0].props.slot || [];

        expect(content).toHaveLength(2);
        expect(content[1].props.id).not.toBe("second");
        expect(content[1].props.prop).toBe("Some example data");
        expectIndexed(
          newState,
          content[1],
          [rootDroppableId, dzZoneCompound, "first:slot"],
          1
        );
      });

      it("should recursively duplicate related items", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "root:slot",
            destinationIndex: 0,
            id: "first",
          }),
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "first:slot",
            destinationIndex: 0,
            id: "second",
          }),
          (state) => ({
            type: "replace",
            destinationZone: "first:slot",
            destinationIndex: 0,
            data: {
              ...state.indexes.nodes["second"].data,
              props: {
                ...state.indexes.nodes["second"].data.props,
                prop: "Some example data",
              },
            },
          }),
          () => ({
            type: "duplicate",
            sourceZone: "root:slot",
            sourceIndex: 0,
          }),
        ]);

        const zone1 = newState.data.root.props?.slot ?? [];
        expect(zone1).toHaveLength(2);
        expect(zone1[1].props.id).not.toBe("second");
        expectIndexed(newState, zone1[1], ["root:slot"], 1);

        const zone2ZoneCompound = `${zone1[1].props.id}:slot`;
        const zone2 = zone1[1].props.slot ?? [];

        expect(zone2).toHaveLength(1);
        expect(zone2[0].props.id).not.toBe("second");
        expect(zone2[0].props.prop).toBe("Some example data");
        expectIndexed(newState, zone2[0], ["root:slot", zone2ZoneCompound], 0);
      });

      it("should select the duplicated item", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "root:slot",
            destinationIndex: 0,
            id: "sampleId",
          }),
          () => ({
            type: "duplicate",
            sourceZone: "root:slot",
            sourceIndex: 0,
          }),
        ]);

        expect(newState.ui.itemSelector?.index).toBe(1);
        expect(newState.ui.itemSelector?.zone).toBe("root:slot");
      });
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
