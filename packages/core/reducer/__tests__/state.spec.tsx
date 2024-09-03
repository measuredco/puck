import { defaultAppState } from "../../components/Puck/context";
import { SetUiAction, createReducer } from "../../reducer";
import { AppState, Config } from "../../types";

type Props = {
  Comp: {
    prop: string;
  };
};

type UserConfig = Config<Props>;

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
});
