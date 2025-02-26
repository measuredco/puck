import { resolveData } from "../resolve-data";
import { createAppStore, defaultAppStore } from "../../store";
import { Config, AppState, Data } from "../../types";
import { waitFor } from "@testing-library/react";

const item1 = { type: "MyComponent", props: { id: "MyComponent-1" } };
const item2 = { type: "MyComponent", props: { id: "MyComponent-2" } };
const item3 = { type: "MyComponent", props: { id: "MyComponent-3" } };

const appStore = createAppStore();

const data: Data = {
  root: { props: { title: "" } },
  content: [item1],
  zones: {
    "MyComponent-1:zone": [item2],
    "MyComponent-2:zone": [item3],
  },
};

const baseState: AppState = {
  ...defaultAppStore.state,
  data,
};

const config: Config = {
  root: {
    resolveData: (rootData) => ({
      ...rootData,
      props: { title: "Resolved title" },
      readOnly: { title: true },
    }),
  },
  components: {
    MyComponent: {
      resolveData: ({ props }) => ({
        props: {
          ...props,
          prop: "Hello, world",
        },
        readOnly: { prop: true },
      }),
      render: () => <div />,
    },
  },
};

describe("resolveData", () => {
  beforeEach(() => {
    appStore.setState({ ...appStore.getInitialState() }, true);
  });

  it("should update store state with resolved data", async () => {
    let dispatchCount = 0;

    appStore.setState({
      state: baseState,
      config,
      dispatch: (action: any) => {
        dispatchCount += 1;

        appStore.getInitialState().dispatch(action);
      },
    });

    expect(dispatchCount).toBe(0);

    await resolveData(appStore.getState().state, appStore.getState());
    expect(dispatchCount).toBe(4);

    await resolveData(appStore.getState().state, appStore.getState());
    expect(dispatchCount).toBe(4); // Check we don't run again

    // Assert
    const finalAppState = appStore.getState().state;

    // We expect all MyComponent props to be "Hello, world", etc.
    // Snapshot or normal expect checks
    expect(finalAppState.data.root.props?.title).toBe("Resolved title");
    expect(finalAppState.data.root.readOnly?.title).toBe(true);
    expect(finalAppState.data.content[0].props.prop).toBe("Hello, world");
    expect(finalAppState.data.content[0].readOnly?.prop).toBe(true);
    expect(finalAppState.data.zones?.["MyComponent-1:zone"][0].props.prop).toBe(
      "Hello, world"
    );
  });

  it("should NOT set updated UI on the first resolveData call", async () => {
    appStore.setState({
      state: baseState,
      config,
    });

    // Pretend new UI has changed, but this is the first run
    const initialState = appStore.getState().state;
    await resolveData(
      {
        ...initialState,
        ui: { ...initialState.ui, leftSideBarVisible: false },
      },
      appStore.getState()
    );

    const finalAppState = appStore.getState().state;
    // The new UI should NOT have been merged on the first call
    expect(finalAppState.ui.leftSideBarVisible).toBe(true);
  });

  it("should set updated UI on subsequent calls", async () => {
    appStore.setState({
      state: baseState,
      config,
    });

    // Counter is outside of lib, so modify manually
    appStore.setState({ resolveDataRuns: 1 });

    // Now call again with changed UI
    await resolveData(
      {
        ...appStore.getState().state,
        ui: { ...appStore.getState().state.ui, leftSideBarVisible: false },
      },
      appStore.getState()
    );

    const finalAppState = appStore.getState().state;
    expect(finalAppState.ui.leftSideBarVisible).toBe(false);
  });

  it("should skip dispatch if there are no resolvers", async () => {
    const mockDispatch = jest.fn();

    appStore.setState({
      dispatch: mockDispatch,
    });

    await resolveData(appStore.getState().state, appStore.getState());

    // Because data won't change, no dispatch is expected
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should call set/unset componentLoading when data is resolved, after a delay", async () => {
    const loadingCalls: Record<string, boolean> = {};
    appStore.setState({
      state: baseState,
      config,
      setComponentLoading: (id) => {
        loadingCalls[id] = true;
      },
      unsetComponentLoading: (id) => {
        loadingCalls[id] = false;
      },
    });

    await resolveData(appStore.getState().state, appStore.getState());

    expect(loadingCalls["MyComponent-1"]).toBeUndefined();

    waitFor(() => expect(loadingCalls["MyComponent-1"]).toBe(true), {
      timeout: 100,
    });
    waitFor(() => expect(loadingCalls["MyComponent-1"]).toBe(false), {
      timeout: 100,
    });
  });

  it("should resolve permissions for each item", async () => {
    appStore.setState({
      state: baseState,
      config,
    });

    const calledFor: string[] = [];
    appStore.setState({
      permissions: {
        ...appStore.getState().permissions,
        resolvePermissions: ({ item }: any) => {
          if (item) calledFor.push(item.props.id);
        },
      },
    });

    await resolveData(appStore.getState().state, appStore.getState());
    expect(calledFor).toContain("MyComponent-1");
    expect(calledFor).toContain("MyComponent-2");
    expect(calledFor).toContain("MyComponent-3");
  });
});
