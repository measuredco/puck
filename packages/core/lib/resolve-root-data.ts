import {
  Config,
  Data,
  DefaultRootFieldProps,
  RootDataWithProps,
} from "../types";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange?: { original: RootDataWithProps; resolved: RootDataWithProps };
} = {};

export async function resolveRootData<
  RootProps extends Record<string, any> = DefaultRootFieldProps
>(data: Data, config: Config) {
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
      original: data.root as RootDataWithProps<RootProps>,
      resolved: resolvedRoot as RootDataWithProps<RootProps>,
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
}
