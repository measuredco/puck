import { resolveComponentData } from "../resolve-component-data";
import { createAppStore } from "../../store";
import { Config } from "../../types";
import { toComponent } from "../data/to-component";

const appStore = createAppStore();

const config: Config = {
  root: {
    fields: {
      title: { type: "text" },
      slot: { type: "slot" },
    },
    resolveData: (rootData) => {
      return {
        ...rootData,
        props: {
          title: "Resolved title",
          slot: [
            {
              type: "MyComponent",
              props: { id: "123456789", prop: "Not yet resolved" },
            },
          ],
        },
        readOnly: { title: true },
      };
    },
  },
  components: {
    MyComponent: {
      resolveData: ({ props }) => {
        return {
          props: {
            ...props,
            prop: "Hello, world",
          },
          readOnly: { prop: true },
        };
      },
      render: () => <div />,
    },
  },
};

describe("resolveComponentData", () => {
  beforeEach(() => {
    appStore.setState({ ...appStore.getInitialState(), config }, true);
  });

  it("should run resolvers for every node in the tree", async () => {
    const { node: newRoot, didChange } = await resolveComponentData(
      toComponent(appStore.getState().state.data.root),
      appStore.getState().config
    );

    expect(newRoot.props?.title).toBe("Resolved title");
    expect(newRoot.readOnly?.title).toBe(true);
    expect(newRoot.props.slot[0].props.prop).toBe("Hello, world");
    expect(newRoot.props.slot[0].readOnly.prop).toBe(true);
    expect(didChange).toBe(true);
  });

  it("should not re-run when node doesn't change", async () => {
    await resolveComponentData(
      toComponent(appStore.getState().state.data.root),
      appStore.getState().config
    );

    const { node: newRoot, didChange } = await resolveComponentData(
      toComponent(appStore.getState().state.data.root),
      appStore.getState().config
    );

    expect(newRoot.props?.title).toBe("Resolved title");
    expect(newRoot.readOnly?.title).toBe(true);
    expect(newRoot.props.slot[0].props.prop).toBe("Hello, world");
    expect(newRoot.props.slot[0].readOnly.prop).toBe(true);
    expect(didChange).toBe(false);
  });
});
