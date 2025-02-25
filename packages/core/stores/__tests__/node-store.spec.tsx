import { renderHook, act } from "@testing-library/react";
import {
  useNodeStore,
  generateNodeStore,
  useRegisterNodeStore,
} from "../node-store";
import { useAppStore, defaultAppState } from "../app-store";
import { Data, ComponentData } from "../../types";
import { rootAreaId, rootZone } from "../../lib/root-droppable-id";

function resetStores() {
  // Reset the main app store
  useAppStore.setState(
    {
      ...useAppStore.getInitialState(),
    },
    true
  );

  // Reset node store
  useNodeStore.setState(
    {
      ...useNodeStore.getInitialState(),
    },
    true
  );
}

describe("node-store", () => {
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
      generateNodeStore(data);
    });

    const { nodes } = useNodeStore.getState();

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
      generateNodeStore(data1);
    });

    expect(useNodeStore.getState().nodes["old-item"]).toBeDefined();

    const data2: Data = {
      root: { props: {} },
      content: [{ type: "MyComponent", props: { id: "new-item" } }],
      zones: {},
    };

    act(() => {
      generateNodeStore(data2);
    });

    expect(useNodeStore.getState().nodes["old-item"]).toBeUndefined();
    expect(useNodeStore.getState().nodes["new-item"]).toBeDefined();
  });

  it("registerNode merges changed data", () => {
    expect(Object.keys(useNodeStore.getState().nodes)).toHaveLength(0);

    act(() => {
      useNodeStore.getState().registerNode("test-1", {
        data: { type: "SomeType", props: { id: "test-1" } },
        parentId: "fake-parent",
        zone: "fake-zone",
      });
    });

    const initialNode = useNodeStore.getState().nodes["test-1"];
    expect(initialNode).toBeDefined();
    expect(initialNode?.zone).toBe("fake-zone");

    // Re-register with partial changes
    act(() => {
      useNodeStore.getState().registerNode("test-1", {
        zone: "new-zone",
      });
    });

    const updatedNode = useNodeStore.getState().nodes["test-1"];
    expect(updatedNode).toBeDefined();
    expect(updatedNode?.zone).toBe("new-zone");
    // The rest stays the same
    expect(updatedNode?.parentId).toBe("fake-parent");

    // If partial data hasn't changed, it won't overwrite
    act(() => {
      useNodeStore.getState().registerNode("test-1", {
        zone: "new-zone", // same as before
      });
    });
    // Confirm it's not overwritten incorrectly
    expect(useNodeStore.getState().nodes["test-1"]?.zone).toBe("new-zone");
  });

  it("registerNode does not update the node at all if data doesn't change", () => {
    expect(Object.keys(useNodeStore.getState().nodes)).toHaveLength(0);

    act(() => {
      useNodeStore.getState().registerNode("test-1", {
        data: { type: "SomeType", props: { id: "test-1" } },
        parentId: "fake-parent",
        zone: "fake-zone",
      });
    });

    const initialNode = useNodeStore.getState().nodes["test-1"];
    expect(initialNode).toBeDefined();
    expect(initialNode?.zone).toBe("fake-zone");

    // Re-register with partial changes
    act(() => {
      useNodeStore.getState().registerNode("test-1", {
        data: { type: "SomeType", props: { id: "test-1" } },
        parentId: "fake-parent",
        zone: "fake-zone",
      });
    });

    const updatedNode = useNodeStore.getState().nodes["test-1"];
    expect(updatedNode).toBe(initialNode); // Check refs are the same
  });

  it("unregisterNode removes from the store", () => {
    act(() => {
      useNodeStore.getState().registerNode("test-2", {
        data: { type: "SomeType", props: { id: "test-2" } },
      });
    });
    expect(useNodeStore.getState().nodes["test-2"]).toBeDefined();

    act(() => {
      useNodeStore.getState().unregisterNode("test-2");
    });
    expect(useNodeStore.getState().nodes["test-2"]).toBeUndefined();
  });

  it("useRegisterNodeStore sets up a subscription that calls generateNodeStore when data changes", () => {
    // We'll spy on generateNodeStore
    const spyGenerateNodeStore = jest.spyOn(
      require("../node-store"),
      "generateNodeStore"
    );

    // Render the hook to create the subscription
    renderHook(() => useRegisterNodeStore());

    // Initially, it won't call generateNodeStore until data changes
    expect(spyGenerateNodeStore).not.toHaveBeenCalled();

    // Now let's modify the data in the app store
    const sampleItem: ComponentData = { type: "X", props: { id: "x1" } };

    act(() => {
      useAppStore.setState({
        state: {
          ...defaultAppState,
          data: {
            ...defaultAppState.data,
            content: [sampleItem],
          },
        },
      });
    });

    expect(spyGenerateNodeStore).toHaveBeenCalledTimes(1);

    // Cleanup
    spyGenerateNodeStore.mockRestore();
  });
});
