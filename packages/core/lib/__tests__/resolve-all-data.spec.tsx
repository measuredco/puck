import { Config, Data } from "../../types/Config";
import { resolveAllData } from "../resolve-all-data";

const item1 = {
  type: "ComponentWithResolveProps",
  props: { id: "MyComponent-1", prop: "Original" },
};
const item2 = {
  type: "ComponentWithoutResolveProps",
  props: { id: "MyComponent-2", prop: "Original" },
};

const data: Data = {
  root: { title: "" },
  content: [item1],
  zones: {
    "MyComponent-1:zone": [item2],
  },
};

const config: Config = {
  components: {
    ComponentWithResolveProps: {
      defaultProps: { prop: "example" },
      resolveData: async ({ props }) => {
        return {
          props: { ...props, prop: "Resolved" },
          readOnly: { prop: true },
        };
      },
      render: () => <div />,
    },
    ComponentWithoutResolveProps: {
      defaultProps: { prop: "example" },
      render: () => <div />,
    },
  },
};

describe("resolve-data", () => {
  it("should resolve the data for all components in the data", async () => {
    expect(await resolveAllData(data, config)).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "props": {
              "id": "MyComponent-1",
              "prop": "Resolved",
            },
            "readOnly": {
              "prop": true,
            },
            "type": "ComponentWithResolveProps",
          },
        ],
        "root": {
          "title": "",
        },
        "zones": {
          "MyComponent-1:zone": [
            {
              "props": {
                "id": "MyComponent-2",
                "prop": "Original",
              },
              "type": "ComponentWithoutResolveProps",
            },
          ],
        },
      }
    `);
  });
});
