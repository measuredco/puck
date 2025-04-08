import { insertAction, InsertAction, PuckAction } from "../reducer";
import { AppStore } from "../store";
import { AppState, Config } from "../types";
import { PrivateAppState } from "../types/Internal";
import { generateId } from "./generate-id";
import { getItem } from "./get-item";
import { resolveComponentData } from "./resolve-component-data";

// Makes testing easier without mocks
export const insertComponent = async (
  componentType: string,
  zone: string,
  index: number,
  appStore: AppStore
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

  const { state, config, dispatch, resolveComponentData } = appStore;

  const insertedState = insertAction(state, insertActionData, config);

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

  const itemData = getItem(itemSelector, insertedState);

  if (itemData) {
    // Run any resolvers, async
    const resolvedData = await resolveComponentData(itemData);

    dispatch({
      type: "replace",
      destinationZone: itemSelector.zone,
      destinationIndex: itemSelector.index,
      data: resolvedData,
    });
  }
};
