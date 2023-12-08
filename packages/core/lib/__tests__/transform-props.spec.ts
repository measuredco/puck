import { transformProps } from "../transform-props";

jest.spyOn(console, "warn").mockImplementation(() => {});

describe("transformProps method", () => {
  it("should migrate props for the root", () => {
    expect(
      transformProps(
        { content: [], root: { props: { title: "Hello, world" } } },
        {
          root: (props) => ({
            updatedTitle: props.title,
          }),
        }
      )
    ).toEqual({
      content: [],
      root: { props: { updatedTitle: "Hello, world" } },
      zones: {},
    });
  });

  // DEPRECATED
  it("should migrate props for the legacy roots", () => {
    expect(
      transformProps(
        { content: [], root: { title: "Hello, world" } },
        {
          root: (props) => ({
            updatedTitle: props.title,
          }),
        }
      )
    ).toEqual({
      content: [],
      root: { updatedTitle: "Hello, world" },
      zones: {},
    });
  });

  it("should migrate props for a specified component", () => {
    expect(
      transformProps(
        {
          content: [
            {
              type: "HeadingBlock",
              props: { title: "Hello, world", id: "123" },
            },
          ],

          root: { props: { title: "Hello, world" } },
          zones: {
            MyZone: [
              {
                type: "HeadingBlock",
                props: { title: "Hello, other world", id: "456" },
              },
            ],
          },
        },
        {
          HeadingBlock: (props) => ({
            heading: props.title,
          }),
        }
      )
    ).toMatchInlineSnapshot(`
      {
        "content": [
          {
            "props": {
              "heading": "Hello, world",
            },
            "type": "HeadingBlock",
          },
        ],
        "root": {
          "props": {
            "title": "Hello, world",
          },
        },
        "zones": {
          "MyZone": [
            {
              "props": {
                "heading": "Hello, other world",
              },
              "type": "HeadingBlock",
            },
          ],
        },
      }
    `);
  });
});
