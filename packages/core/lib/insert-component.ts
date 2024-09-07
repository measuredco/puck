import { insertAction, InsertAction, PuckAction } from "../reducer";
import { AppState, Config } from "../types";
import { generateId } from "./generate-id";

// Makes testing easier without mocks
export const insertComponent = (
  componentType: string,
  zone: string,
  index: number,
  {
    config,
    dispatch,
    resolveData,
    state,
  }: {
    config: Config;
    dispatch: (action: PuckAction) => void;
    resolveData: (newAppState: AppState) => void;
    state: AppState;
  }
) => {
  // Reuse newData so ID retains parity between dispatch and resolver
  const id = generateId(componentType);

  const insertActionData: InsertAction = {
    type: "insert",
    componentType,
    destinationIndex: index,
    destinationZone: zone,
    id,
  };

  const insertedData = insertAction(state.data, insertActionData, config);

  // Dispatch the insert, immediately
  dispatch({
    ...insertActionData, // Dispatch insert rather set, as user's may rely on this via onAction

    // We must always record history here so the insert is added to user history
    // If the user has defined a resolveData method, they will end up with 2 history
    // entries on insert - one for the initial insert, and one when the data resolves
    recordHistory: true,
  });

  const itemSelector = {
    index,
    zone,
  };

  // Select the item, immediately
  dispatch({ type: "setUi", ui: { itemSelector } });

  // Run any resolvers, async
  resolveData({
    data: insertedData,
    ui: { ...state.ui, itemSelector },
  });
};
