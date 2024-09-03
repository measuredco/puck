import { Data, DefaultComponentProps, DefaultRootFieldProps } from "../types";
import { defaultData } from "./default-data";

type PropTransform<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultRootFieldProps
> = Partial<
  {
    [ComponentName in keyof Props]: (
      props: Props[ComponentName] & { [key: string]: any }
    ) => Props[ComponentName];
  } & { root: (props: RootProps & { [key: string]: any }) => RootProps }
>;

export function transformProps<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultRootFieldProps
>(data: Partial<Data>, propTransforms: PropTransform<Props, RootProps>): Data {
  const mapItem = (item: any) => {
    if (propTransforms[item.type]) {
      return {
        ...item,
        props: propTransforms[item.type]!(item.props as any),
      };
    }

    return item;
  };

  const defaultedData = defaultData(data);

  // DEPRECATED
  const rootProps = defaultedData.root.props || defaultedData.root;
  let newRoot = { ...defaultedData.root };
  if (propTransforms["root"]) {
    if (defaultedData.root.props) {
      newRoot.props = propTransforms["root"](rootProps as any);
    } else {
      newRoot = propTransforms["root"](rootProps as any);
    }
  }

  const afterPropTransforms: Data = {
    ...defaultedData,
    root: newRoot,
    content: defaultedData.content.map(mapItem),
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
