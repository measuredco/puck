import { Data, DefaultComponentProps, DefaultRootProps } from "../types/Config";

type PropTransform<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultRootProps = DefaultRootProps
> = Partial<
  {
    [ComponentName in keyof Props]: (
      props: Props[ComponentName] & { [key: string]: any }
    ) => Props[ComponentName];
  } & { root: (props: RootProps & { [key: string]: any }) => RootProps }
>;

export function transformProps<
  Props extends DefaultComponentProps = DefaultComponentProps,
  RootProps extends DefaultComponentProps = DefaultComponentProps
>(data: Data, propTransforms: PropTransform<Props, RootProps>): Data {
  const mapItem = (item) => {
    if (propTransforms[item.type]) {
      return {
        ...item,
        props: propTransforms[item.type]!(item.props as any),
      };
    }

    return item;
  };

  // DEPRECATED
  const rootProps = data.root.props || data.root;
  let newRoot = { ...data.root };
  if (propTransforms["root"]) {
    if (data.root.props) {
      newRoot.props = propTransforms["root"](rootProps as any);
    } else {
      newRoot = propTransforms["root"](rootProps as any);
    }
  }

  const afterPropTransforms: Data = {
    ...data,
    root: newRoot,
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
