// lib/__tests__/use-breadcrumbs.spec.ts
import { renderHook, act } from "@testing-library/react";
import { useBreadcrumbs } from "../use-breadcrumbs";
import { useAppStore } from "../../stores/app-store";
import { useNodeStore } from "../../stores/node-store";
import { ComponentData, Config } from "../../types";

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

describe("useBreadcrumbs", () => {
  beforeEach(() => {
    resetStores();
  });

  it("returns an empty array if no path is found", () => {
    // No nodes, no selectedItem => path is undefined
    const { result } = renderHook(() => useBreadcrumbs());
    expect(result.current).toEqual([]);
  });

  it("returns a breadcrumb path including 'Page' for root", () => {
    // 1) Set up the config & selected item in the app store
    const config: Config = {
      components: {
        MyComponent: {
          label: "My Component Label",
          render: () => <div />,
        },
      },
    };

    const testItem: ComponentData = {
      type: "MyComponent",
      props: { id: "item-1" },
    };

    const testItem2: ComponentData = {
      type: "MyComponent",
      props: { id: "item-2" },
    };

    // 2) Assign config & selected item to the app store
    useAppStore.setState({
      config,
      selectedItem: testItem2,
    });

    // 3) We'll manually populate the node store with path info
    // Typical usage would be from generateNodeStore, but we can do it inline for this test
    act(() => {
      useNodeStore.getState().registerNode("root", {
        data: { type: "root", props: { id: "root" } },
      });
      useNodeStore.getState().registerNode("item-1", {
        data: testItem,
        parentId: "root",
        zone: "default-zone",
        path: ["root"],
        index: 0,
      });
      useNodeStore.getState().registerNode("item-2", {
        data: testItem2,
        parentId: "item-1",
        zone: "zone",
        path: ["root", "item-1:zone"],
        index: 0,
      });
    });

    // 4) Now call the hook
    const { result } = renderHook(() => useBreadcrumbs());

    // 5) Expect the result to include the "Page" crumb plus the item crumb
    expect(result.current).toEqual([
      { label: "Page", selector: null },
      {
        label: "My Component Label",
        selector: { index: 0, zone: "root" },
      },
    ]);
  });

  it("truncates the breadcrumb list to renderCount if provided", () => {
    // 1) Set up the config & selected item in the app store
    const config: Config = {
      components: {
        MyComponent: {
          label: "My Component Label",
          render: () => <div />,
        },
      },
    };

    const testItem: ComponentData = {
      type: "MyComponent",
      props: { id: "item-1" },
    };

    const testItem2: ComponentData = {
      type: "MyComponent",
      props: { id: "item-2" },
    };

    // 2) Assign config & selected item to the app store
    useAppStore.setState({
      config,
      selectedItem: testItem2,
    });

    // 3) We'll manually populate the node store with path info
    // Typical usage would be from generateNodeStore, but we can do it inline for this test
    act(() => {
      useNodeStore.getState().registerNode("root", {
        data: { type: "root", props: { id: "root" } },
      });
      useNodeStore.getState().registerNode("item-1", {
        data: testItem,
        parentId: "root",
        zone: "default-zone",
        path: ["root"],
        index: 0,
      });
      useNodeStore.getState().registerNode("item-2", {
        data: testItem2,
        parentId: "item-1",
        zone: "zone",
        path: ["root", "item-1:zone"],
        index: 0,
      });
    });

    // 4) Now call the hook
    const { result } = renderHook(() => useBreadcrumbs(1));

    // 5) Expect the result to include the "Page" crumb plus the item crumb
    expect(result.current).toEqual([
      {
        label: "My Component Label",
        selector: { index: 0, zone: "root" },
      },
    ]);
  });

  it("defaults to using the type name if config.components[type].label is missing", () => {
    // 1) Set up the config & selected item in the app store
    const config: Config = {
      components: {
        MyComponent: {
          render: () => <div />,
        },
      },
    };

    const testItem: ComponentData = {
      type: "MyComponent",
      props: { id: "item-1" },
    };

    const testItem2: ComponentData = {
      type: "MyComponent",
      props: { id: "item-2" },
    };

    // 2) Assign config & selected item to the app store
    useAppStore.setState({
      config,
      selectedItem: testItem2,
    });

    // 3) We'll manually populate the node store with path info
    // Typical usage would be from generateNodeStore, but we can do it inline for this test
    act(() => {
      useNodeStore.getState().registerNode("root", {
        data: { type: "root", props: { id: "root" } },
      });
      useNodeStore.getState().registerNode("item-1", {
        data: testItem,
        parentId: "root",
        zone: "default-zone",
        path: ["root"],
        index: 0,
      });
      useNodeStore.getState().registerNode("item-2", {
        data: testItem2,
        parentId: "item-1",
        zone: "zone",
        path: ["root", "item-1:zone"],
        index: 0,
      });
    });

    // 4) Now call the hook
    const { result } = renderHook(() => useBreadcrumbs());

    // 5) Expect the result to include the "Page" crumb plus the item crumb
    expect(result.current).toEqual([
      { label: "Page", selector: null },
      {
        label: "MyComponent", // Fall back to type name
        selector: { index: 0, zone: "root" },
      },
    ]);
  });
});
