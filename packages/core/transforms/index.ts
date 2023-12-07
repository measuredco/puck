import { Data, DefaultComponentProps, DefaultRootProps } from "../types/Config";
import { migrations } from "./migrations";

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

export function migrate(data: Data): Data {
  return migrations?.reduce((acc, migration) => migration(acc), data) as Data;
}

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

  const afterPropTransforms: Data = {
    ...data,
    root: propTransforms["root"]
      ? {
          ...rootProps,
          props: propTransforms["root"](rootProps as any),
        }
      : data.root,
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
