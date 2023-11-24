import {
  CurrentData,
  Data,
  DefaultComponentProps,
  LegacyData,
} from "../types/Config";
import { dataTransforms } from "./data-transforms";

export type DataTransform = (
  props: LegacyData & { [key: string]: any }
) => CurrentData;

// type TransformFn =
type PropTransform<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps
> = Partial<
  {
    [ComponentName in keyof Props]: (
      props: Props[ComponentName] & { [key: string]: any }
    ) => Props[ComponentName];
  } & { root: (props: RootProps & { [key: string]: any }) => RootProps }
>;

export function transformData(data: Data): CurrentData {
  return dataTransforms?.reduce(
    (acc, dataTransform) => dataTransform(acc),
    data
  ) as CurrentData;
}

export function transformProps<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps
>(data: Data, propTransforms: PropTransform<Props, RootProps>): CurrentData {
  const afterDataTransform = transformData(data);

  const mapItem = (item) => {
    if (propTransforms[item.type]) {
      return {
        ...item,
        props: propTransforms[item.type]!(item.props as any),
      };
    }

    return item;
  };

  const afterPropTransforms: CurrentData = {
    ...data,
    root: propTransforms["root"]
      ? propTransforms["root"](afterDataTransform.root.props as any)
      : afterDataTransform.root,
    content: data.content.map(mapItem),
    zones: Object.keys(data.zones || {}).reduce(
      (acc, zoneKey) => ({
        ...acc,
        [zoneKey]: data.zones![zoneKey].map(mapItem),
      }),
      {}
    ),
  };

  return afterPropTransforms;
}
