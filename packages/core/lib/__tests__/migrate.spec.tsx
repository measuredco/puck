import { Config, Data } from "../../types";
import { migrate } from "../migrate";

jest.spyOn(console, "warn").mockImplementation(() => {});

describe("migrate method", () => {
  it("should migrate root to root.props", () => {
    expect(
      migrate(
        { content: [], root: { title: "Hello, world" } },
        { components: {} }
      )
    ).toEqual({
      content: [],
      root: { props: { title: "Hello, world" } },
    });
  });

  it("should migrate zones to slots", () => {
    const input: Data = {
      content: [{ type: "Flex", props: { id: "Flex-123" } }],
      root: {},
      zones: {
        "Flex-123:flex": [{ type: "Other", props: { id: "Other-123" } }],
        "Other-123:content": [
          { type: "Heading", props: { id: "Heading-456" } },
        ],
      },
    };

    const config: Config = {
      components: {
        Flex: {
          fields: {
            // Migrate to slots for Flex
            flex: { type: "slot" },
          },
          render: () => <div />,
        },
        Other: {
          fields: {
            // Migrate to slots for Other
            content: { type: "slot" },
          },
          render: () => <div />,
        },
        Heading: {
          render: () => <div />,
        },
      },
    };

    const output: Data = {
      content: [
        {
          type: "Flex",
          props: {
            id: "Flex-123",
            flex: [
              {
                type: "Other",
                props: {
                  id: "Other-123",
                  content: [{ type: "Heading", props: { id: "Heading-456" } }],
                },
              },
            ],
          },
        },
      ],
      root: { props: {} },
    };

    expect(migrate(input, config)).toEqual(output);
  });

  it("should throw if matching slots aren't defined", () => {
    const input: Data = {
      content: [{ type: "Grid", props: { id: "Grid-123" } }],
      root: {},
      zones: {
        "Grid-123:grid": [{ type: "Heading", props: { id: "Heading-123" } }],
      },
    };

    const config: Config = {
      components: {
        Grid: {
          render: () => <div />,
        },
        Heading: {
          render: () => <div />,
        },
      },
    };

    expect(() => migrate(input, config)).toThrowErrorMatchingInlineSnapshot(
      `"Could not migrate DropZone "Grid-123:grid" to slot field. No slot exists with the name "grid"."`
    );
  });
});
