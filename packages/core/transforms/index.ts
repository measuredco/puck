import { AppState, Data } from "../types/Config";
import { dataTransforms } from "./data-transforms";

export type DataTransform = (props: Data & { [key: string]: any }) => Data;

type PropTransform<Components = any> = {
  [ComponentName in keyof Components]: (
    props: Components[ComponentName] & { [key: string]: any }
  ) => Components[ComponentName];
};

export const runTransforms = (
  appState: AppState,
  propTransforms: PropTransform[]
): AppState => {
  const afterDataTransforms = dataTransforms.reduce(
    (acc, dataTransform) => dataTransform(acc),
    appState.data
  );

  return { ...appState, data: afterDataTransforms };
};
