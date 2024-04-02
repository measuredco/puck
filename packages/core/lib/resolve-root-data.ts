import { Config, Data, RootDataWithProps } from "../types/Config";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange?: { original: RootDataWithProps; resolved: RootDataWithProps };
} = {};

export const resolveRootData = async (data: Data, config: Config) => {
  if (config.root?.resolveData && data.root.props) {
    if (cache.lastChange?.original === data.root) {
      return cache.lastChange.resolved;
    }

    const changed = getChanged(data.root, cache.lastChange?.original);

    const rootWithProps = data.root as RootDataWithProps;

    const resolvedRoot = await config.root?.resolveData(rootWithProps, {
      changed,
      lastData: cache.lastChange?.original || {},
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
