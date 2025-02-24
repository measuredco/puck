import { defaultAppState } from "../../stores/app-store";
import { rootDroppableId } from "../../lib/root-droppable-id";
import {
  DuplicateAction,
  RemoveAction,
  SetUiAction,
  createReducer,
} from "../../reducer";
import { AppState, Config, Data, UiState } from "../../types";

type Props = {
  Comp: {
    prop: string;
  };
};

type UserConfig = Config<Props>;

const defaultData: Data = defaultAppState.data;
const defaultUi: UiState = defaultAppState.ui;

describe("State reducer", () => {
  const config: UserConfig = {
    components: {
      Comp: {
        defaultProps: { prop: "example" },
        render: () => <div />,
      },
    },
  };

  const reducer = createReducer({ config });

  describe("setUi action", () => {
    it("should insert data into the state", () => {
      const state: AppState = defaultAppState;

      const action: SetUiAction = {
        type: "setUi",
        ui: { leftSideBarVisible: false },
      };

      const newState = reducer(state, action);
      expect(newState.ui.leftSideBarVisible).toEqual(false);
    });
  });

  describe("duplicate action", () => {
    it("should select the duplicated item", () => {
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [
            {
              type: "Comp",
              props: { id: "sampleId", prop: "Some example data" },
            },
          ],
        },
      };
      const action: DuplicateAction = {
        type: "duplicate",
        sourceIndex: 0,
        sourceZone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.ui.itemSelector?.index).toBe(1);
      expect(newState.ui.itemSelector?.zone).toBe(rootDroppableId);
    });
  });

  describe("remove action", () => {
    it("should deselect the item", () => {
      const state: AppState = {
        ui: defaultUi,
        data: {
          ...defaultData,
          content: [
            {
              type: "Comp",
              props: { id: "sampleId", prop: "Some example data" },
            },
          ],
        },
      };
      const action: RemoveAction = {
        type: "remove",
        index: 0,
        zone: rootDroppableId,
      };

      const newState = reducer(state, action);
      expect(newState.ui.itemSelector).toBeNull();
    });
  });
});
