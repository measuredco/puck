import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import {
  AppState,
  ComponentConfig,
  ComponentData,
  Config,
  Data,
} from "../../types";
import { useResolvedData } from "../use-resolved-data";
import { SetAction, SetDataAction } from "../../reducer";
import { cache } from "../resolve-component-data";
import { defaultAppState } from "../../components/Puck/context";
import { useResolvedPermissions } from "../use-resolved-permissions";

type Props = {
  MyComponent: { example: "banana" | "apple" };
};

type RootProps = {
  example: "banana" | "apple";
  title?: string;
};

type UserData = Data<Props, RootProps>;

type MyComponentData = ComponentData<Props["MyComponent"], "MyComponent">;

const item1: MyComponentData = {
  type: "MyComponent",
  props: { id: "MyComponent-1", example: "banana" },
};
const item2: MyComponentData = {
  type: "MyComponent",
  props: { id: "MyComponent-2", example: "banana" },
};
const item3: MyComponentData = {
  type: "MyComponent",
  props: { id: "MyComponent-3", example: "banana" },
};

const data: UserData = {
  root: { props: { example: "banana" } },
  content: [item1],
  zones: {
    "MyComponent-1:zone": [item2],
    "MyComponent-2:zone": [item3],
  },
};

type UserAppState = AppState<UserData>;

const state: UserAppState = {
  data,
  ui: defaultAppState.ui,
};

const modifiedState: UserAppState = {
  ...state,

  data: {
    ...state.data,
    root: {
      ...state.data.root,
      props: {
        ...state.data.root.props,
        example: "apple",
      },
    },
    content: [
      {
        ...state.data.content[0],
        props: {
          ...state.data.content[0].props,
          example: "apple",
        },
      },
    ],
  },
};

type UserConfig = Config<Props, RootProps>;

const config: UserConfig = {
  root: {},
  components: {
    MyComponent: {
      defaultProps: { example: "banana" },
      render: () => <div />,
    },
  },
};

let timesResolved = 0;
let timesRootResolved = 0;

const configWithResolvedComponentPermissions: UserConfig = {
  ...config,
  root: {
    ...config.root,
    resolvePermissions: async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 50));

      timesRootResolved = timesRootResolved + 1;

      if (data.props?.example === "apple") {
        return { resolved: true, apple: true };
      }

      return { resolved: true };
    },
  },
  components: {
    ...config.components,
    MyComponent: {
      ...config.components.MyComponent,
      resolvePermissions: async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 50));

        timesResolved = timesResolved + 1;

        if (data.props.example === "apple") {
          return { resolved: true, apple: true };
        }

        return { resolved: true };
      },
    },
  },
};

const configWithResolvedComponentPermissionsSync: UserConfig = {
  ...config,
  root: {
    ...config.root,
    resolvePermissions: (data) => {
      timesRootResolved = timesRootResolved + 1;

      if (data.props?.example === "apple") {
        return { resolved: true, apple: true };
      }

      return { resolved: true };
    },
  },
  components: {
    ...config.components,
    MyComponent: {
      ...config.components.MyComponent,
      resolvePermissions: (data) => {
        timesResolved = timesResolved + 1;

        if (data.props.example === "apple") {
          return { resolved: true, apple: true };
        }

        return { resolved: true };
      },
    },
  },
};

const configWithComponentPermissions: UserConfig = {
  ...config,
  root: {
    ...config.root,
    permissions: {
      component: true,
    },
  },
  components: {
    ...config.components,
    MyComponent: {
      ...config.components.MyComponent,
      permissions: {
        component: true,
      },
    },
  },
};

const globalPermissions = {
  global: true,
  component: false,
  resolved: false,
};

const setupTest = (
  _config: UserConfig = config,
  _state: UserAppState = state
) => {
  const initialProps = {
    config: _config,
    state: _state,
    globalPermissions,
  };
  const renderedHook = renderHook(
    (props) => {
      return useResolvedPermissions(
        props.config,
        props.state,
        props.globalPermissions
      );
    },
    { initialProps }
  );

  const { getPermissions, refreshPermissions } = renderedHook.result.current;

  return { renderedHook, getPermissions, refreshPermissions, initialProps };
};

describe("use-resolved-permissions", () => {
  beforeEach(() => {
    timesResolved = 0;
    timesRootResolved = 0;
    cleanup();
  });

  it("should set loading state during resolution, when a resolver is defined", () => {
    let setLoadCalled = false;
    let unsetLoadCalled = false;

    const setLoad = () => {
      setLoadCalled = true;
    };

    const unsetLoad = () => {
      unsetLoadCalled = true;
    };

    renderHook(() => {
      return useResolvedPermissions(
        configWithResolvedComponentPermissions,
        state,
        globalPermissions,
        setLoad,
        unsetLoad
      );
    });

    expect(setLoadCalled).toBeTruthy();
  });

  it("should not set loading state during resolution, when no resolver defined", () => {
    let setLoadCalled = false;
    let unsetLoadCalled = false;

    const setLoad = () => {
      setLoadCalled = true;
    };

    const unsetLoad = () => {
      unsetLoadCalled = true;
    };

    renderHook(() => {
      return useResolvedPermissions(
        config,
        state,
        globalPermissions,
        setLoad,
        unsetLoad
      );
    });

    expect(setLoadCalled).toBeFalsy();
    expect(unsetLoadCalled).toBeFalsy();
  });

  describe("getPermissions method", () => {
    it("should return global permissions if no args passed", async () => {
      const { getPermissions } = setupTest(config);

      expect(getPermissions()).toEqual(globalPermissions);
    });

    describe("`type` param", () => {
      it("should return component permissions when specified", () => {
        expect(
          setupTest(configWithComponentPermissions).getPermissions({
            type: "MyComponent",
          })
        ).toEqual({
          global: true,
          component: true,
          resolved: false,
        });
      });

      it("should fallback to global permissions", () => {
        expect(setupTest().getPermissions({ type: "MyComponent" })).toEqual(
          globalPermissions
        );
      });
    });

    describe("`item` param", () => {
      it("should return resolved permissions when specified", async () => {
        const { renderedHook } = setupTest(
          configWithResolvedComponentPermissions
        );

        await waitFor(() =>
          expect(
            renderedHook.result.current.getPermissions({
              item: { type: "MyComponent", props: { id: "MyComponent-1" } },
            })
          ).toEqual({
            global: true,
            component: false,
            resolved: true,
          })
        );
      });

      it("should fallback to component permissions", () => {
        expect(
          setupTest(configWithComponentPermissions).getPermissions({
            item: { type: "MyComponent", props: { id: "MyComponent-1" } },
          })
        ).toEqual({
          global: true,
          component: true,
          resolved: false,
        });
      });

      it("should fallback to global permissions", () => {
        expect(
          setupTest().getPermissions({
            item: { type: "MyComponent", props: { id: "MyComponent-1" } },
          })
        ).toEqual(globalPermissions);
      });
    });

    describe("`root` param", () => {
      it("should return resolved permissions when specified", async () => {
        const { renderedHook } = setupTest(
          configWithResolvedComponentPermissions
        );

        await waitFor(() =>
          expect(
            renderedHook.result.current.getPermissions({
              root: true,
            })
          ).toEqual({
            global: true,
            component: false,
            resolved: true,
          })
        );
      });

      it("should return permissions when specified", () => {
        expect(
          setupTest(configWithComponentPermissions).getPermissions({
            root: true,
          })
        ).toEqual({
          global: true,
          component: true,
          resolved: false,
        });
      });

      it("should return global permissions when not specified", () => {
        expect(
          setupTest(config).getPermissions({
            root: true,
          })
        ).toEqual({
          global: true,
          component: false,
          resolved: false,
        });
      });
    });

    describe("after appState.data change", () => {
      describe("`item` param", () => {
        it("should return resolved permissions against updated props when specified", async () => {
          const { renderedHook } = setupTest(
            configWithResolvedComponentPermissions
          );

          await act(async () => {
            renderedHook.rerender({
              config: configWithResolvedComponentPermissions,
              state: modifiedState,
              globalPermissions,
            });
          });

          await waitFor(
            () =>
              expect(
                renderedHook.result.current.getPermissions({
                  item: { type: "MyComponent", props: { id: "MyComponent-1" } },
                })
              ).toEqual({
                global: true,
                component: false,
                resolved: true,
                apple: true,
              }),
            { timeout: 200 }
          );
        });
      });

      describe("`root` param", () => {
        it("should return resolved permissions against updated props when specified", async () => {
          const { renderedHook } = setupTest(
            configWithResolvedComponentPermissions
          );

          await act(async () => {
            renderedHook.rerender({
              config: configWithResolvedComponentPermissions,
              state: modifiedState,
              globalPermissions,
            });
          });

          await waitFor(
            () =>
              expect(
                renderedHook.result.current.getPermissions({
                  root: true,
                })
              ).toEqual({
                global: true,
                component: false,
                resolved: true,
                apple: true,
              }),
            { timeout: 200 }
          );
        });
      });
    });

    describe("after config change", () => {
      describe("`type` param", () => {
        it("should return component permissions when specified", async () => {
          const { renderedHook, initialProps } = setupTest(
            configWithResolvedComponentPermissions
          );

          await act(async () => {
            renderedHook.rerender({
              ...initialProps,
              config: configWithComponentPermissions,
            });
          });

          await waitFor(
            () =>
              expect(
                renderedHook.result.current.getPermissions({
                  type: "MyComponent",
                })
              ).toEqual({
                global: true,
                component: true,
                resolved: false,
              }),
            { timeout: 200 }
          );
        });
      });

      describe("`item` param", () => {
        it("should return resolved permissions when specified", async () => {
          const { renderedHook, initialProps } = setupTest(config);

          await act(async () => {
            renderedHook.rerender({
              ...initialProps,
              config: configWithResolvedComponentPermissions,
            });
          });

          await waitFor(
            () =>
              expect(
                renderedHook.result.current.getPermissions({
                  item: {
                    type: "MyComponent",
                    props: { id: "MyComponent-1" },
                  },
                })
              ).toEqual({
                global: true,
                component: false,
                resolved: true,
              }),
            { timeout: 200 }
          );
        });
      });

      describe("`root` param", () => {
        it("should return resolved permissions when specified", async () => {
          const { renderedHook, initialProps } = setupTest(config);

          await act(async () => {
            renderedHook.rerender({
              ...initialProps,
              config: configWithResolvedComponentPermissions,
            });
          });

          await waitFor(
            () =>
              expect(
                renderedHook.result.current.getPermissions({
                  root: true,
                })
              ).toEqual({
                global: true,
                component: false,
                resolved: true,
              }),
            { timeout: 200 }
          );
        });
      });
    });
  });

  describe("refreshPermissions method", () => {
    it("should refresh all permissions when called", async () => {
      const { refreshPermissions } = setupTest(
        configWithResolvedComponentPermissionsSync
      );

      expect(timesResolved).toBe(3);

      await act(async () => {
        refreshPermissions();
      });

      // Ignores prop cache
      expect(timesResolved).toBe(6);
    });

    describe("`type` param", () => {
      it("should refresh permissions of all items for a given type when called", async () => {
        const { refreshPermissions, renderedHook } = setupTest(
          configWithResolvedComponentPermissionsSync
        );

        expect(timesResolved).toBe(3);

        await act(async () => {
          refreshPermissions({ type: "MyComponent" });
        });

        expect(
          renderedHook.result.current.getPermissions({
            item: {
              type: "MyComponent",
              props: { id: "MyComponent-1" },
            },
          })
        ).toEqual({
          global: true,
          component: false,
          resolved: true,
        });

        expect(timesResolved).toBe(6);
      });
    });

    describe("`item` param", () => {
      it("should refresh the item permissions when called", async () => {
        const { refreshPermissions, renderedHook } = setupTest(
          configWithResolvedComponentPermissionsSync
        );

        expect(timesResolved).toBe(3);

        await act(async () => {
          refreshPermissions({
            item: {
              type: "MyComponent",
              props: { id: "MyComponent-1", example: "banana" },
            },
          });
        });

        expect(
          renderedHook.result.current.getPermissions({
            item: {
              type: "MyComponent",
              props: { id: "MyComponent-1" },
            },
          })
        ).toEqual({
          global: true,
          component: false,
          resolved: true,
        });

        expect(timesResolved).toBe(4);
      });
    });

    describe("`root` param", () => {
      it("should refresh the root permissions when called", async () => {
        const { refreshPermissions, renderedHook } = setupTest(
          configWithResolvedComponentPermissionsSync
        );

        expect(timesRootResolved).toBe(1);

        await act(async () => {
          refreshPermissions({
            root: true,
          });
        });

        expect(
          renderedHook.result.current.getPermissions({
            root: true,
          })
        ).toEqual({
          global: true,
          component: false,
          resolved: true,
        });

        expect(timesRootResolved).toBe(2);
      });
    });
  });
});
