import { SetStateAction, createReducer } from "../../reducer";
import { AppData, AppState, Config, Data } from "../../types/Config";

type Props = {
  Comp: {
    prop: string;
  };
};
const defaultData: Data = { root: { title: "" }, content: [], zones: {} };

const defaultState: AppState = { leftSideBarVisible: true };

describe("State reducer", () => {
  const config: Config<Props> = {
    components: {
      Comp: {
        defaultProps: { prop: "example" },
        render: () => <div />,
      },
    },
  };

  const reducer = createReducer({ config });

  describe("setState action", () => {
    it("should insert data into the state", () => {
      const state: AppData = { state: defaultState, data: defaultData };

      const action: SetStateAction = {
        type: "setState",
        state: { leftSideBarVisible: false },
      };

      const newState = reducer(state, action);
      expect(newState.state.leftSideBarVisible).toEqual(false);
    });
  });
});
