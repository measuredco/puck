import { renderHook, act, waitFor } from "@testing-library/react";
import {
  usePermissionsStore,
  useRegisterPermissionsStore,
} from "../permissions-store";
import { useAppStore, defaultAppState } from "../app-store";
import { rootDroppableId } from "../../lib/root-droppable-id";

function resetStores() {
  useAppStore.setState(
    {
      ...useAppStore.getInitialState(),
    },
    true
  );

  usePermissionsStore.setState({
    cache: {},
    globalPermissions: {
      drag: true,
      edit: true,
      delete: true,
      duplicate: true,
      insert: true,
    },
    resolvedPermissions: {},
  });
}

describe("permissions-store", () => {
  beforeEach(() => {
    resetStores();
  });

  it("resolves on load", async () => {
    const mockResolvePermissions = jest.fn().mockReturnValue({});

    useAppStore.setState({
      config: {
        root: {
          render: () => <div />,
          resolvePermissions: mockResolvePermissions,
        },
        components: {},
      },
      state: {
        ...defaultAppState,
        data: {
          content: [],
          root: { props: { title: "Hello, world" } },
          zones: {},
        },
      },
    });

    renderHook(() => useRegisterPermissionsStore({ foo: true }));

    expect(mockResolvePermissions).toHaveBeenCalledTimes(1);
  });

  it("auto-resolves when appStore data changes", async () => {
    const mockResolvePermissions = jest.fn().mockReturnValue({});

    useAppStore.setState({
      config: {
        root: {
          render: () => <div />,
          resolvePermissions: mockResolvePermissions,
        },
        components: {},
      },
      state: {
        ...defaultAppState,
        data: {
          content: [],
          root: { props: { title: "Hello, world" } },
          zones: {},
        },
      },
    });

    renderHook(() => useRegisterPermissionsStore({ foo: true }));

    expect(mockResolvePermissions).toHaveBeenCalledTimes(1);

    useAppStore.setState({
      state: {
        ...defaultAppState,
        data: {
          ...useAppStore.getState().state.data,
          root: {
            props: {
              title: "Goodbye, world",
            },
          },
        },
      },
    });

    expect(mockResolvePermissions).toHaveBeenCalledTimes(2);
  });

  it("sets loading state if a resolver is defined, and doesn't if none is defined", async () => {
    let loadingCalled = false;
    let unloadingCalled = false;

    // Mock to see if they are called
    useAppStore.setState({
      setComponentLoading: () => {
        loadingCalled = true;
      },
      unsetComponentLoading: () => {
        unloadingCalled = true;
      },
    });

    renderHook(() => useRegisterPermissionsStore({ globalTest: true }));

    await act(async () => {
      usePermissionsStore.getState().resolvePermissions();
    });

    expect(loadingCalled).toBe(false);
    expect(unloadingCalled).toBe(false);

    resetStores();
    loadingCalled = false;
    unloadingCalled = false;

    useAppStore.setState({
      config: {
        components: {
          MyComponent: {
            render: () => <div />,
            resolvePermissions: async () => ({}),
          },
        },
      },
      setComponentLoading: () => {
        loadingCalled = true;
      },
      unsetComponentLoading: () => {
        unloadingCalled = true;
      },
      state: {
        ...defaultAppState,
        data: {
          ...defaultAppState.data,
          content: [{ type: "MyComponent", props: { id: "comp-1" } }],
        },
      },
    });

    renderHook(() => useRegisterPermissionsStore({ globalTest: true }));

    await act(async () => {
      usePermissionsStore.getState().resolvePermissions();
    });

    // Now we expect calls
    expect(loadingCalled).toBe(true);
    expect(unloadingCalled).toBe(true);
  });

  describe("getPermissions()", () => {
    it("returns global permissions by default", () => {
      renderHook(() => useRegisterPermissionsStore({ testGlobal: true }));

      const perms = usePermissionsStore.getState().getPermissions();
      expect(perms.testGlobal).toBe(true);
      expect(perms.drag).toBe(true); // default
    });

    it("returns merged component permissions if present", () => {
      useAppStore.setState({
        config: {
          components: {
            MyComponent: {
              render: () => <div />,
              permissions: { fromComponent: true },
            },
          },
        },
      });

      renderHook(() => useRegisterPermissionsStore({ fromGlobal: true }));

      const perms = usePermissionsStore.getState().getPermissions({
        item: { type: "MyComponent", props: { id: "component-1" } },
      });
      expect(perms.fromGlobal).toBe(true);
      expect(perms.fromComponent).toBe(true);
    });

    it("returns merged root permissions if present", () => {
      useAppStore.setState({
        config: {
          root: {
            permissions: { rootPerm: true },
          },
          components: {},
        },
      });

      renderHook(() => useRegisterPermissionsStore({ fromGlobal: true }));

      const perms = usePermissionsStore
        .getState()
        .getPermissions({ root: true });
      expect(perms.fromGlobal).toBe(true);
      expect(perms.rootPerm).toBe(true);
    });
  });

  describe("resolvePermissions()", () => {
    it("calls component.resolvePermissions if defined", async () => {
      const resolvePermissions = jest.fn().mockReturnValue({
        resolved: true,
      });

      useAppStore.setState({
        ...useAppStore.getInitialState(),
        config: {
          components: {
            MyComponent: {
              render: () => <div />,
              permissions: { base: true },
              resolvePermissions,
            },
          },
        },
        state: {
          ...defaultAppState,
          data: {
            ...defaultAppState.data,
            content: [{ type: "MyComponent", props: { id: "comp-1" } }],
          },
        },
      });

      renderHook(() => useRegisterPermissionsStore({ globalTest: true }));

      await act(async () => {
        await usePermissionsStore.getState().resolvePermissions();
        await usePermissionsStore.getState().resolvePermissions(); // Double calls shouldn't run resolvers if data hasn't changed
      });

      expect(resolvePermissions).toHaveBeenCalledTimes(2);
      expect(resolvePermissions).toHaveBeenCalledWith(
        {
          props: { id: "comp-1" },
          type: "MyComponent",
        },
        {
          appState: useAppStore.getState().state,
          changed: { id: true },
          lastData: null,
          lastPermissions: null,
          permissions: {
            base: true,
            delete: true,
            drag: true,
            duplicate: true,
            edit: true,
            globalTest: true,
            insert: true,
          },
        }
      );

      // Confirm that getPermissions merges in resolved perms
      const perms = usePermissionsStore.getState().getPermissions({
        item: { type: "MyComponent", props: { id: "comp-1" } },
      });
      expect(perms.resolved).toBe(true);
      expect(perms.globalTest).toBe(true);
    });

    it("provides correct args to component.resolvePermissions on subsequent calls", async () => {
      const resolvePermissions = jest.fn().mockReturnValue({
        resolved: true,
      });

      useAppStore.setState({
        config: {
          components: {
            MyComponent: {
              render: () => <div />,
              permissions: { base: true },
              resolvePermissions,
            },
          },
        },
        state: {
          ...defaultAppState,
          data: {
            ...defaultAppState.data,
            content: [{ type: "MyComponent", props: { id: "comp-1" } }],
          },
        },
      });

      renderHook(() => useRegisterPermissionsStore({ globalTest: true }));

      await act(async () => {
        await usePermissionsStore.getState().resolvePermissions();

        const { dispatch } = useAppStore.getState();

        // Will auto trigger an update
        dispatch({
          type: "replace",
          data: {
            props: { id: "comp-1", title: "changed" },
            type: "MyComponent",
          },
          destinationIndex: 0,
          destinationZone: rootDroppableId,
        });
      });

      expect(resolvePermissions).toHaveBeenCalledTimes(3);
      expect(resolvePermissions).toHaveBeenCalledWith(
        {
          props: { id: "comp-1", title: "changed" },
          type: "MyComponent",
        },
        {
          appState: useAppStore.getState().state,
          changed: { id: false, title: true },
          lastData: {
            props: { id: "comp-1" },
            type: "MyComponent",
          },
          lastPermissions: { resolved: true },
          permissions: {
            base: true,
            delete: true,
            drag: true,
            duplicate: true,
            edit: true,
            globalTest: true,
            insert: true,
          },
        }
      );

      // Confirm that getPermissions merges in resolved perms
      const perms = usePermissionsStore.getState().getPermissions({
        item: { type: "MyComponent", props: { id: "comp-1" } },
      });
      expect(perms.resolved).toBe(true);
      expect(perms.globalTest).toBe(true);
    });

    it("updates if item changes or if force = true", async () => {
      let resolveCalls = 0;
      useAppStore.setState({
        config: {
          components: {
            MyComponent: {
              render: () => <div />,
              resolvePermissions: async (item) => {
                resolveCalls += 1;
                if (item.props.id === "changed-1") {
                  return { changed: true };
                }
                return { notChanged: true };
              },
            },
          },
        },
        state: {
          ...defaultAppState,
          data: {
            ...defaultAppState.data,
            content: [{ type: "MyComponent", props: { id: "comp-1" } }],
          },
        },
      });

      renderHook(() => useRegisterPermissionsStore({ testGlobal: true }));

      // Initial
      await act(async () => {
        await usePermissionsStore.getState().resolvePermissions();
      });
      expect(resolveCalls).toBe(2);

      // If nothing changed, calling again won't re-resolve
      await act(async () => {
        await usePermissionsStore.getState().resolvePermissions();
      });
      expect(resolveCalls).toBe(2);

      // Force => resolves again
      await act(async () => {
        await usePermissionsStore.getState().resolvePermissions({}, true);
      });
      expect(resolveCalls).toBe(3);

      // Change item => triggers new resolution
      useAppStore.setState({
        state: {
          ...defaultAppState,
          data: {
            content: [{ type: "MyComponent", props: { id: "changed-1" } }],
            root: {},
            zones: {},
          },
        },
      });

      // Watcher will trigger this
      expect(resolveCalls).toBe(4);
    });
  });

  describe("integration with useAppStore subscriptions", () => {
    it("auto-resolves when appStore config changes", async () => {
      let resolveCalled = false;
      useAppStore.setState({
        config: {
          components: {
            MyComponent: {
              render: () => <div />,
              resolvePermissions: async () => {
                resolveCalled = true;
                return { newPerm: true };
              },
            },
          },
        },
        state: {
          ...defaultAppState,
          data: {
            content: [{ type: "MyComponent", props: { id: "test-1" } }],
            root: {},
            zones: {},
          },
        },
      });

      renderHook(() => useRegisterPermissionsStore({ fromGlobal: true }));

      // config is already set before hooking, so do a manual "change" to trigger subscription
      await act(async () => {
        useAppStore.setState({
          config: {
            components: {
              MyComponent: {
                render: () => <div />,
                resolvePermissions: async () => {
                  resolveCalled = true;
                  return { changedPerm: true };
                },
              },
            },
          },
        });
      });

      await waitFor(() => expect(resolveCalled).toBe(true));
    });
  });
});
