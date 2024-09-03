import {
  DuplicateAction,
  InsertAction,
  MoveAction,
  RegisterZoneAction,
  RemoveAction,
  ReorderAction,
  ReplaceAction,
  SetDataAction,
  UnregisterZoneAction,
  createReducer,
} from "../../reducer";
import { AppState, Config, Data, UiState } from "../../types";
import { rootDroppableId } from "../../lib/root-droppable-id";

import { generateId } from "../../lib/generate-id";
import { defaultAppState } from "../../components/Puck/context";

jest.mock("../../lib/generate-id");

const mockedGenerateId = generateId as jest.MockedFunction<typeof generateId>;

type Props = {
  Comp: {
    prop: string;
  };
};

type UserConfig = Config<Props>;

const defaultData: Data = {
  root: { props: { title: "" } },
  content: [],
  zones: {},
};

const defaultUi: UiState = defaultAppState.ui;

describe("Data reducer", () => {
  const config: UserConfig = {
    components: {
      Comp: {
        defaultProps: { prop: "example" },
        render: () => <div />,
      },
    },
  };

  const reducer = createReducer({ config });

  describe("insert action", () => {
    it("should insert into rootDroppableId", () => {
      const state: AppState = { ui: defaultUi, data: { ...defaultData } };

      const action: InsertAction = {
        type: "insert",
        componentType: "Comp",
        destinationIndex: 0,
        destinationZone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.data.content[0]).toHaveProperty("type", "Comp");
      expect(newState.data.content[0].props).toHaveProperty("prop", "example");
    });

    it("should insert into a different zone", () => {
      const state: AppState = { ui: defaultUi, data: { ...defaultData } };
      const action: InsertAction = {
        type: "insert",
        componentType: "Comp",
        destinationIndex: 0,
        destinationZone: "zone1",
      };

      const newState = reducer(state, action);
      expect(newState.data.zones?.zone1[0]).toHaveProperty("type", "Comp");

      expect(newState.data.zones?.zone1[0].props).toHaveProperty(
        "prop",
        "example"
      );
    });
  });

  describe("reorder action", () => {
    it("should reorder within rootDroppableId", () => {
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [
            { type: "Comp", props: { id: "1" } },
            { type: "Comp", props: { id: "2" } },
          ],
        },
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
      const state: AppState = {
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
      const state: AppState = {
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
      const state: AppState = {
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

      const state: AppState = {
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
  });

  describe("move action", () => {
    it("should move from rootDroppableId to another zone", () => {
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
          zones: { zone1: [{ type: "Comp", props: { id: "2" } }] },
        },
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
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
          zones: { zone1: [{ type: "Comp", props: { id: "2" } }] },
        },
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
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [],
          zones: {
            zone1: [{ type: "Comp", props: { id: "1" } }],
            zone2: [{ type: "Comp", props: { id: "2" } }],
          },
        },
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
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
        },
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
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
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
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [{ type: "Comp", props: { id: "1" } }],
        },
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
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
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

      const state: AppState = {
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
  });

  describe("unregisterZone action", () => {
    it("should unregister a zone", () => {
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
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
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          zones: { zone1: [{ type: "Comp", props: { id: "1" } }] },
        },
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
      const state: AppState = { ui: defaultUi, data: { ...defaultData } };
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
});
