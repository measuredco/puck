import {
  Config,
  Data,
  DefaultRootFieldProps,
  Metadata,
  RootData,
  RootDataWithProps,
} from "../types";
import { getChanged } from "./get-changed";

export const cache: {
  lastChange?: { original: RootDataWithProps; resolved: RootDataWithProps };
} = {};

export async function resolveRootData<
  RootProps extends Record<string, any> = DefaultRootFieldProps
>(
  rootData: RootData,
  config: Config,
  metadata: Metadata,
  onResolveStart?: (rootData: RootData) => void,
  onResolveEnd?: (rootData: RootData) => void
) {
  if (config.root?.resolveData && rootData.props) {
    if (cache.lastChange?.original === rootData) {
      return cache.lastChange.resolved;
    }

    if (onResolveStart) {
      onResolveStart(rootData);
    }

    const changed = getChanged(rootData, cache.lastChange?.original);

    const rootWithProps = rootData as RootDataWithProps;

    const resolvedRoot = await config.root?.resolveData(rootWithProps, {
      changed,
      lastData: cache.lastChange?.original || {},
      metadata: metadata || {},
    });

    cache.lastChange = {
      original: rootData as RootDataWithProps<RootProps>,
      resolved: resolvedRoot as RootDataWithProps<RootProps>,
    };

    if (onResolveEnd) {
      onResolveEnd(resolvedRoot);
    }

    return {
      ...rootData,
      ...resolvedRoot,
      props: {
        ...rootData.props,
        ...resolvedRoot.props,
      },
    };
  }

  return rootData;
}
