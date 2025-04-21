import { ComponentData, Config, Data, Slot, UiState } from "../../../types";

import {
  createAppStore,
  defaultAppState as _defaultAppState,
} from "../../../store";
import { PrivateAppState } from "../../../types/Internal";
import { walkTree } from "../walk-tree";
import { stripSlots } from "../strip-slots";
import { rootDroppableId } from "../../root-droppable-id";

type Props = {
  Comp: {
    prop: string;
    slotA: Slot;
    slotB: Slot;
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

  expect(state.indexes.zones[zoneCompound]?.contentIds[index]).toEqual(
    item.props.id
  );
  expect(state.indexes.nodes[item.props.id].data).toEqual(item);
  expect(state.indexes.nodes[item.props.id].flatData).toEqual(stripSlots(item));
  expect(state.indexes.nodes[item.props.id].path).toEqual(path);
};

describe("walk-tree", () => {
  const config: UserConfig = {
    root: {
      fields: { title: { type: "text" }, slot: { type: "slot" } },
    },
    components: {
      Comp: {
        fields: {
          prop: { type: "text" },
          slotA: { type: "slot" },
          slotB: { type: "slot" },
        },
        defaultProps: { prop: "example", slotA: [], slotB: [] },
        render: () => <div />,
      },
    },
  };

  beforeEach(() => {
    appStore.setState(
      {
        ...appStore.getInitialState(),
        config,
      },
      true
    );
  });

  it("should generate the correct index for a given payload", () => {
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
                props: {
                  id: "another-id",
                  prop: "Even more example data",
                  slotA: [
                    {
                      type: "Comp",
                      props: { id: "slotted-a-id", prop: "Inside a slot" },
                    },
                  ],
                  slotB: [
                    {
                      type: "Comp",
                      props: { id: "slotted-b-id", prop: "Inside a slot" },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      config
    );

    expectIndexed(state, state.data.content[0], [rootDroppableId], 0);

    expectIndexed(
      state,
      state.data.zones?.["my-component:zone"][0],
      [rootDroppableId, "my-component:zone"],
      0
    );

    expectIndexed(
      state,
      state.data.zones?.["other-component:zone"][0],
      [rootDroppableId, "my-component:zone", "other-component:zone"],
      0
    );

    expectIndexed(
      state,
      state.data.zones?.["other-component:zone"][0].props.slotA[0],
      [
        rootDroppableId,
        "my-component:zone",
        "other-component:zone",
        "another-id:slotA",
      ],
      0
    );

    expectIndexed(
      state,
      state.data.zones?.["other-component:zone"][0].props.slotB[0],
      [
        rootDroppableId,
        "my-component:zone",
        "other-component:zone",
        "another-id:slotB",
      ],
      0
    );

    expect(state.indexes).toMatchInlineSnapshot(`
      {
        "nodes": {
          "another-id": {
            "data": {
              "props": {
                "id": "another-id",
                "prop": "Even more example data",
                "slotA": [
                  {
                    "props": {
                      "id": "slotted-a-id",
                      "prop": "Inside a slot",
                    },
                    "type": "Comp",
                  },
                ],
                "slotB": [
                  {
                    "props": {
                      "id": "slotted-b-id",
                      "prop": "Inside a slot",
                    },
                    "type": "Comp",
                  },
                ],
              },
              "type": "Comp",
            },
            "flatData": {
              "props": {
                "id": "another-id",
                "prop": "Even more example data",
              },
              "type": "Comp",
            },
            "parentId": "other-component",
            "path": [
              "root:default-zone",
              "my-component:zone",
              "other-component:zone",
            ],
            "zone": "zone",
          },
          "my-component": {
            "data": {
              "props": {
                "id": "my-component",
                "prop": "Data",
              },
              "type": "Comp",
            },
            "flatData": {
              "props": {
                "id": "my-component",
                "prop": "Data",
              },
              "type": "Comp",
            },
            "parentId": "root",
            "path": [
              "root:default-zone",
            ],
            "zone": "default-zone",
          },
          "other-component": {
            "data": {
              "props": {
                "id": "other-component",
                "prop": "More example data",
              },
              "type": "Comp",
            },
            "flatData": {
              "props": {
                "id": "other-component",
                "prop": "More example data",
              },
              "type": "Comp",
            },
            "parentId": "my-component",
            "path": [
              "root:default-zone",
              "my-component:zone",
            ],
            "zone": "zone",
          },
          "root": {
            "data": {
              "props": {
                "id": "root",
                "slot": [],
                "title": "",
              },
              "type": "root",
            },
            "flatData": {
              "props": {
                "id": "root",
                "slot": [],
                "title": "",
              },
              "type": "root",
            },
            "parentId": null,
            "path": [],
            "zone": "",
          },
          "slotted-a-id": {
            "data": {
              "props": {
                "id": "slotted-a-id",
                "prop": "Inside a slot",
              },
              "type": "Comp",
            },
            "flatData": {
              "props": {
                "id": "slotted-a-id",
                "prop": "Inside a slot",
              },
              "type": "Comp",
            },
            "parentId": "another-id",
            "path": [
              "root:default-zone",
              "my-component:zone",
              "other-component:zone",
              "another-id:slotA",
            ],
            "zone": "slotA",
          },
          "slotted-b-id": {
            "data": {
              "props": {
                "id": "slotted-b-id",
                "prop": "Inside a slot",
              },
              "type": "Comp",
            },
            "flatData": {
              "props": {
                "id": "slotted-b-id",
                "prop": "Inside a slot",
              },
              "type": "Comp",
            },
            "parentId": "another-id",
            "path": [
              "root:default-zone",
              "my-component:zone",
              "other-component:zone",
              "another-id:slotB",
            ],
            "zone": "slotB",
          },
        },
        "zones": {
          "another-id:slotA": {
            "contentIds": [
              "slotted-a-id",
            ],
            "type": "slot",
          },
          "another-id:slotB": {
            "contentIds": [
              "slotted-b-id",
            ],
            "type": "slot",
          },
          "my-component:zone": {
            "contentIds": [
              "other-component",
            ],
            "type": "dropzone",
          },
          "my-component:zone1": {
            "contentIds": [],
            "type": "dropzone",
          },
          "other-component:zone": {
            "contentIds": [
              "another-id",
            ],
            "type": "dropzone",
          },
          "root:default-zone": {
            "contentIds": [
              "my-component",
            ],
            "type": "root",
          },
          "root:slot": {
            "contentIds": [],
            "type": "slot",
          },
        },
      }
    `);
  });
});
