import { CurrentData, LegacyData } from "../types/Config";
import { dataTransforms } from "./data-transforms";

export type DataTransform = (
  props: LegacyData & { [key: string]: any }
) => CurrentData;

type PropTransform<Components = any> = {
  [ComponentName in keyof Components]: (
    props: Components[ComponentName] & { [key: string]: any }
  ) => Components[ComponentName];
};

export const runTransforms = (
  data: LegacyData,
  propTransforms: PropTransform[]
): CurrentData => {
  const afterDataTransforms = dataTransforms.reduce(
    (acc, dataTransform) => dataTransform(acc),
    data
  ) as CurrentData;

  return afterDataTransforms;
};
