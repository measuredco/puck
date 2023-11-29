import { useAppContext } from "../components/Puck/context";

export const usePuck = () => {
  const { state: appState, config, dispatch } = useAppContext();

  return { appState, config, dispatch };
};
