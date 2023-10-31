import { Config, Data, RootDataWithProps } from "../types/Config";

export const cache: {
  lastChange?: { original: RootDataWithProps; resolved: RootDataWithProps };
} = {};

export const resolveRootData = async (data: Data, config: Config) => {
  if (config.root?.resolveData && data.root.props) {
    let changed = Object.keys(data.root.props).reduce(
      (acc, item) => ({ ...acc, [item]: true }),
      {}
    );

    if (cache.lastChange) {
      const { original, resolved } = cache.lastChange;

      if (original === data.root) {
        return resolved;
      }

      Object.keys(data.root.props).forEach((propName) => {
        if (original.props[propName] === data.root.props![propName]) {
          changed[propName] = false;
        }
      });
    }

    const rootWithProps = data.root as RootDataWithProps;

    const resolvedRoot = await config.root?.resolveData(rootWithProps, {
      changed,
    });

    cache.lastChange = {
      original: data.root as RootDataWithProps,
      resolved: resolvedRoot as RootDataWithProps,
    };

    return {
      ...data.root,
      ...resolvedRoot,
      props: {
        ...data.root.props,
        ...resolvedRoot.props,
      },
    };
  }

  return data.root;
};
