import { DropZoneContext } from "../../components/DropZone/context";
import { Config, Data } from "../../types/Config";
import { isChildOfZone } from "../is-child-of-zone";

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
    Comp: {
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

describe("is-child-of-zone", () => {
  it("should return true when item is child of zone for first item", () => {
    expect(isChildOfZone(item1, item2, dropzoneContext)).toBe(true);
  });

  it("should return true when item is child of zone for second item", () => {
    expect(isChildOfZone(item2, item3, dropzoneContext)).toBe(true);
  });

  it("should return false when item is not child of zone", () => {
    expect(isChildOfZone(item2, item1, dropzoneContext)).toBe(false);
  });
});
