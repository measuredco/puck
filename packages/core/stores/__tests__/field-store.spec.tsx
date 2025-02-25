import { renderHook, act, waitFor } from "@testing-library/react";
import { useFieldStore, useRegisterFieldStore } from "../field-store";
import { generateNodeStore, useNodeStore } from "../node-store";
import { defaultAppState, useAppStore } from "../app-store";
import { Config, ComponentData, AppState } from "../../types";

const baseState: AppState = {
  ...defaultAppState,
  data: {
    content: [
      {
        type: "Heading",
        props: { id: "heading-1", title: "Hello" },
      },
    ],
    root: {},
    zones: {},
  },
};

function resetStores() {
  // Reset main app store:
  useAppStore.setState(
    { ...useAppStore.getInitialState(), state: baseState },
    true
  );

  // Reset node store:
  useNodeStore.setState(useNodeStore.getInitialState());

  // Reset field store:
  useFieldStore.setState(useFieldStore.getInitialState());
}

const selectFirst = (config: Config) => {
  useAppStore.setState({
    ...useAppStore.getState(),
    config,
    selectedItem: useAppStore.getState().state.data.content[0],
  });
};

describe("field-store", () => {
  beforeEach(() => {
    resetStores();
    generateNodeStore(useAppStore.getState().state.data);
  });

  it("returns default fields if no resolver is defined", async () => {
    const config: Config = {
      components: {
        Heading: {
          fields: { title: { type: "text" } },
          render: () => <div />,
        },
      },
    };

    selectFirst(config);

    renderHook(() => useRegisterFieldStore());

    const { fields, loading } = useFieldStore.getState();

    expect(fields).toEqual({ title: { type: "text" } });
    expect(loading).toBe(false);
  });

  it("calls the root resolveFields if defined", async () => {
    const mockResolveFields = jest.fn().mockResolvedValue({
      title: { type: "textarea" },
    });

    const config: Config = {
      components: {
        Heading: {
          fields: { title: { type: "text" } },
          render: () => <div />,
        },
      },
      root: {
        resolveFields: mockResolveFields,
      },
    };

    useAppStore.setState({
      config,
    });

    renderHook(() => useRegisterFieldStore());
    expect(mockResolveFields).toHaveBeenCalledTimes(1);
    expect(mockResolveFields).toHaveBeenCalledWith(
      {
        props: { id: "root" },
        type: "root",
      },
      {
        appState: useAppStore.getState().state,
        changed: {
          id: true,
        },
        fields: { title: { type: "text" } },
        lastData: {},
        lastFields: { title: { type: "text" } },
        parent: null,
      }
    );

    await waitFor(() => {
      const { fields, loading } = useFieldStore.getState();
      expect(fields).toEqual({ title: { type: "textarea" } });
      expect(loading).toBe(false);
    });
  });

  it("calls a component's resolveFields if defined", async () => {
    const mockResolveFields = jest.fn().mockResolvedValue({
      title: { type: "textarea" },
    });

    selectFirst({
      components: {
        Heading: {
          fields: { title: { type: "text" } },
          render: () => <div />,
          // Our test resolver:
          resolveFields: mockResolveFields,
        },
      },
    });

    renderHook(() => useRegisterFieldStore());
    expect(mockResolveFields).toHaveBeenCalledTimes(1);
    expect(mockResolveFields).toHaveBeenCalledWith(
      {
        props: { id: "heading-1", title: "Hello" },
        type: "Heading",
      },
      {
        appState: useAppStore.getState().state,
        changed: {
          id: true,
          title: true,
        },
        fields: { title: { type: "text" } },
        lastData: null,
        lastFields: { title: { type: "text" } },
        parent: { props: { id: "root" }, type: "root" },
      }
    );

    // We set a short timeout in the store (50 ms) before loading = true,
    // so let's wait for that plus the async resolution:
    await waitFor(() => {
      const { fields, loading } = useFieldStore.getState();
      // Once resolved, we expect the store to hold the new fields:
      expect(fields).toEqual({ title: { type: "textarea" } });
      expect(loading).toBe(false);
    });
  });

  it("calls a component's resolveFields with correct fields on subsequent calls", async () => {
    const mockResolveFields = jest.fn().mockResolvedValue({
      title: { type: "textarea" },
    });

    selectFirst({
      components: {
        Heading: {
          fields: { title: { type: "text" } },
          render: () => <div />,
          // Our test resolver:
          resolveFields: mockResolveFields,
        },
      },
    });

    renderHook(() => useRegisterFieldStore());

    // We set a short timeout in the store (50 ms) before loading = true,
    // so let's wait for that plus the async resolution:
    await waitFor(() => {
      const { fields } = useFieldStore.getState();
      expect(fields).toEqual({ title: { type: "textarea" } });
    });

    mockResolveFields.mockReset();

    // Change data and check result
    act(() => {
      useAppStore.getState().dispatch({
        type: "replace",
        data: {
          ...useAppStore.getState().selectedItem,
          props: {
            ...useAppStore.getState().selectedItem?.props,
            title: "Hello, world",
          },
        },
        destinationIndex: 0,
        destinationZone: "root:default-zone",
      });

      generateNodeStore(useAppStore.getState().state.data);
    });

    expect(mockResolveFields).toHaveBeenCalledTimes(1);
    expect(mockResolveFields).toHaveBeenCalledWith(
      {
        props: { id: "heading-1", title: "Hello, world" },
        type: "Heading",
      },
      {
        appState: useAppStore.getState().state,
        changed: {
          id: false,
          title: true,
        },
        fields: { title: { type: "text" } },
        lastData: {
          props: { id: "heading-1", title: "Hello" },
          type: "Heading",
        },
        lastFields: { title: { type: "textarea" } },
        parent: { props: { id: "root" }, type: "root" },
      }
    );
  });

  it("calls a component's resolveFields with correct fields on subsequent calls, if item changes", async () => {
    const mockResolveFields = jest.fn().mockResolvedValue({
      title: { type: "textarea" },
    });

    selectFirst({
      components: {
        Heading: {
          fields: { title: { type: "text" } },
          render: () => <div />,
          // Our test resolver:
          resolveFields: mockResolveFields,
        },
        Block: {
          fields: { title: { type: "number" } },
          render: () => <div />,
          // Our test resolver:
          resolveFields: mockResolveFields,
        },
      },
    });

    renderHook(() => useRegisterFieldStore());

    // We set a short timeout in the store (50 ms) before loading = true,
    // so let's wait for that plus the async resolution:
    await waitFor(() => {
      const { fields } = useFieldStore.getState();
      expect(fields).toEqual({ title: { type: "textarea" } });
    });

    mockResolveFields.mockReset();

    // Change data and check result
    act(() => {
      const newItem: ComponentData = {
        props: { id: "block-1", title: "1" },
        type: "Block",
      };

      useAppStore.setState({
        state: {
          ...useAppStore.getState().state,
          data: {
            ...useAppStore.getState().state.data,
            content: [...useAppStore.getState().state.data.content, newItem],
          },
        },
        selectedItem: newItem,
      });

      generateNodeStore(useAppStore.getState().state.data);
    });

    expect(mockResolveFields).toHaveBeenCalledTimes(1);
    expect(mockResolveFields).toHaveBeenCalledWith(
      {
        props: { id: "block-1", title: "1" },
        type: "Block",
      },
      {
        appState: useAppStore.getState().state,
        changed: {
          id: true,
          title: true,
        },
        fields: { title: { type: "number" } },
        lastData: null,
        lastFields: { title: { type: "number" } },
        parent: { props: { id: "root" }, type: "root" },
      }
    );
  });

  it("sets loading = true if resolver is slow (deferred loading)", async () => {
    // Make a resolver that waits
    const mockResolveFields = jest
      .fn()
      .mockImplementation(async (data, { fields }) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ...fields,
              body: { type: "textarea" },
            });
          }, 100);
        });
      });

    const config: Config = {
      components: {
        Heading: {
          fields: { title: { type: "text" } },
          render: () => <div />,
          resolveFields: mockResolveFields,
        },
      },
    };

    selectFirst(config);

    renderHook(() => useRegisterFieldStore());

    // After 50ms, loading should become true:
    await waitFor(() => {
      expect(useFieldStore.getState().loading).toBe(true);
    });

    // After 100ms total, the resolver finishes:
    await waitFor(() => {
      const { fields, loading } = useFieldStore.getState();
      expect(fields).toEqual({
        title: { type: "text" },
        body: { type: "textarea" },
      });
      expect(loading).toBe(false);
      expect(mockResolveFields).toHaveBeenCalledTimes(1);
    });
  });

  it("updates fields again if node data changes", async () => {
    const mockResolveFields = jest.fn().mockResolvedValue({
      title: { type: "text" },
    });

    const config: Config = {
      components: {
        Heading: {
          fields: { title: { type: "text" } },
          render: () => <div />,
          resolveFields: mockResolveFields,
        },
      },
    };

    selectFirst(config);

    renderHook(() => useRegisterFieldStore());

    // First call
    expect(mockResolveFields).toHaveBeenCalledTimes(1);

    // Now let's simulate a data change
    const selectedItem = useAppStore.getState().selectedItem;
    const updatedItem = {
      ...selectedItem,
      props: { ...selectedItem?.props, title: "Newly changed" },
    };

    act(() => {
      useAppStore.getState().dispatch({
        type: "replace",
        data: updatedItem,
        destinationIndex: 0,
        destinationZone: "root:default-zone",
      });

      generateNodeStore(useAppStore.getState().state.data);
    });

    // The subscription should trigger a second resolve:
    await waitFor(() => {
      expect(mockResolveFields).toHaveBeenCalledTimes(2);
    });
  });
});
