import { renderHook, act } from "@testing-library/react";
import { generateNodesSlice, useRegisterNodesSlice } from "../nodes";
import { defaultAppState, createAppStore } from "../../";
import { Data, ComponentData } from "../../../types";
import { rootAreaId, rootZone } from "../../../lib/root-droppable-id";

const appStore = createAppStore();

function resetStores() {
  // Reset the main app store
  appStore.setState(
    {
      ...appStore.getInitialState(),
    },
    true
  );
}

describe("nodes slice", () => {
  beforeEach(() => {
    resetStores();
  });

  it("generates an index from the app's content and zones", () => {
    const item1: ComponentData = {
      type: "MyComponent",
      props: { id: "item-1" },
    };
    const item2: ComponentData = {
      type: "AnotherComponent",
      props: { id: "item-2" },
    };

    const data: Data = {
      root: { props: {} },
      content: [item1],
      zones: {
        "item-1:zoneA": [item2],
      },
    };

    act(() => {
      generateNodesSlice(data, appStore);
    });

    const { nodes } = appStore.getState().nodes;

    expect(nodes["item-1"]).toBeDefined();
    expect(nodes["item-1"]?.parentId).toBe(rootAreaId);
    expect(nodes["item-1"]?.zone).toBe(rootZone);
    expect(nodes["item-1"]?.index).toBe(0);

    expect(nodes["item-2"]).toBeDefined();
    expect(nodes["item-2"]?.parentId).toBe("item-1");
    expect(nodes["item-2"]?.zone).toBe("zoneA");
    expect(nodes["item-2"]?.index).toBe(0);

    expect(nodes["root"]).toBeDefined();
    expect(nodes["root"]?.data.type).toBe("root");
  });

  it("removes old nodes that no longer appear in the data", () => {
    const data1: Data = {
      root: { props: {} },
      content: [{ type: "MyComponent", props: { id: "old-item" } }],
      zones: {},
    };

    act(() => {
      generateNodesSlice(data1, appStore);
    });

    expect(appStore.getState().nodes.nodes["old-item"]).toBeDefined();

    const data2: Data = {
      root: { props: {} },
      content: [{ type: "MyComponent", props: { id: "new-item" } }],
      zones: {},
    };

    act(() => {
      generateNodesSlice(data2, appStore);
    });

    expect(appStore.getState().nodes.nodes["old-item"]).toBeUndefined();
    expect(appStore.getState().nodes.nodes["new-item"]).toBeDefined();
  });

  it("registerNode merges changed data", () => {
    expect(Object.keys(appStore.getState().nodes.nodes)).toHaveLength(0);

    act(() => {
      appStore.getState().nodes.registerNode("test-1", {
        data: { type: "SomeType", props: { id: "test-1" } },
        parentId: "fake-parent",
        zone: "fake-zone",
      });
    });

    const initialNode = appStore.getState().nodes.nodes["test-1"];
    expect(initialNode).toBeDefined();
    expect(initialNode?.zone).toBe("fake-zone");

    // Re-register with partial changes
    act(() => {
      appStore.getState().nodes.registerNode("test-1", {
        zone: "new-zone",
      });
    });

    const updatedNode = appStore.getState().nodes.nodes["test-1"];
    expect(updatedNode).toBeDefined();
    expect(updatedNode?.zone).toBe("new-zone");
    // The rest stays the same
    expect(updatedNode?.parentId).toBe("fake-parent");

    // If partial data hasn't changed, it won't overwrite
    act(() => {
      appStore.getState().nodes.registerNode("test-1", {
        zone: "new-zone", // same as before
      });
    });
    // Confirm it's not overwritten incorrectly
    expect(appStore.getState().nodes.nodes["test-1"]?.zone).toBe("new-zone");
  });

  it("registerNode does not update the node at all if data doesn't change", () => {
    expect(Object.keys(appStore.getState().nodes.nodes)).toHaveLength(0);

    act(() => {
      appStore.getState().nodes.registerNode("test-1", {
        data: { type: "SomeType", props: { id: "test-1" } },
        parentId: "fake-parent",
        zone: "fake-zone",
      });
    });

    const initialNode = appStore.getState().nodes.nodes["test-1"];
    expect(initialNode).toBeDefined();
    expect(initialNode?.zone).toBe("fake-zone");

    // Re-register with partial changes
    act(() => {
      appStore.getState().nodes.registerNode("test-1", {
        data: { type: "SomeType", props: { id: "test-1" } },
        parentId: "fake-parent",
        zone: "fake-zone",
      });
    });

    const updatedNode = appStore.getState().nodes.nodes["test-1"];
    expect(updatedNode).toBe(initialNode); // Check refs are the same
  });

  it("unregisterNode removes from the store", () => {
    act(() => {
      appStore.getState().nodes.registerNode("test-2", {
        data: { type: "SomeType", props: { id: "test-2" } },
      });
    });
    expect(appStore.getState().nodes.nodes["test-2"]).toBeDefined();

    act(() => {
      appStore.getState().nodes.unregisterNode("test-2");
    });
    expect(appStore.getState().nodes.nodes["test-2"]).toBeUndefined();
  });

  it("useRegisterNodesSlice sets up a subscription that calls generateNodesSlice when data changes", () => {
    // We'll spy on generateNodesSlice
    const spyGenerateNodesSlice = jest.spyOn(
      require("../nodes"),
      "generateNodesSlice"
    );

    // Render the hook to create the subscription
    renderHook(() => useRegisterNodesSlice(appStore));

    // Initially, it won't call generateNodesSlice until data changes
    expect(spyGenerateNodesSlice).not.toHaveBeenCalled();

    // Now let's modify the data in the app store
    const sampleItem: ComponentData = { type: "X", props: { id: "x1" } };

    act(() => {
      appStore.setState({
        state: {
          ...defaultAppState,
          data: {
            ...defaultAppState.data,
            content: [sampleItem],
          },
        },
      });
    });

    expect(spyGenerateNodesSlice).toHaveBeenCalledTimes(1);

    // Cleanup
    spyGenerateNodesSlice.mockRestore();
  });
});
