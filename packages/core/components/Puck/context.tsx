import { createContext, useContext } from "react";
import { AppData, AppState } from "../../types/Config";
import { PuckAction } from "../../reducer";

export const defaultAppData: AppData = {
  data: { content: [], root: { title: "" } },
  state: {
    leftSideBarVisible: true,
    arrayState: {},
  },
};

type AppContext = {
  appData: AppData;
  dispatch: (action: PuckAction) => void;
};

export const appContext = createContext<AppContext>({
  appData: defaultAppData,
  dispatch: () => null,
});

export const AppProvider = appContext.Provider;

export const useAppContext = () => {
  const mainContext = useContext(appContext);

  return {
    ...mainContext,
    // Helper
    setState: (state: Partial<AppState>, recordHistory?: boolean) => {
      return mainContext.dispatch({
        type: "setState",
        state,
        recordHistory,
      });
    },
  };
};
