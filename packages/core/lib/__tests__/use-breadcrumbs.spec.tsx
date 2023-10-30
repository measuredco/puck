import { DropZoneContext } from "../../components/DropZone/context";
import { Config, Data } from "../../types/Config";
import { Breadcrumb, convertPathDataToBreadcrumbs } from "../use-breadcrumbs";

const item1 = { type: "MyComponent", props: { id: "MyComponent-1" } };
const item2 = { type: "MyComponent", props: { id: "MyComponent-2" } };
const item3 = { type: "MyComponent", props: { id: "MyComponent-3" } };

const data: Data = {
  root: { title: "" },
  content: [item1],
  zones: {
    "MyComponent-1:zone": [item2],
    "MyComponent-2:zone": [item3],
  },
};

const config: Config = {
  components: {
    MyComponent: {
      defaultProps: { prop: "example" },
      render: () => <div />,
    },
  },
};

const dropzoneContext: DropZoneContext = {
  data,
  config,
  pathData: {
    "MyComponent-1": { path: [], label: "MyComponent" },
    "MyComponent-2": { path: ["MyComponent-1:zone"], label: "MyComponent" },
    "MyComponent-3": {
      path: ["MyComponent-1:zone", "MyComponent-2:zone"],
      label: "MyComponent",
    },
  },
};

describe("use-breadcrumbs", () => {
  describe("convert-path-data-to-breadcrumbs", () => {
    it("should convert path data to breadcrumbs", () => {
      expect(
        convertPathDataToBreadcrumbs(item3, dropzoneContext.pathData, data)
      ).toMatchInlineSnapshot(`
        [
          {
            "label": "MyComponent",
            "selector": {
              "index": 0,
              "zone": "default-zone",
            },
            "zoneCompound": "MyComponent-1:zone",
          },
          {
            "label": "MyComponent",
            "selector": {
              "index": 0,
              "zone": "MyComponent-1:zone",
            },
            "zoneCompound": "MyComponent-2:zone",
          },
        ]
      `);
    });
  });
});
