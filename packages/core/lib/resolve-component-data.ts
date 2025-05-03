import {
  ComponentData,
  Config,
  Metadata,
  ResolveDataTrigger,
  RootDataWithProps,
} from "../types";
import { mapSlotsAsync } from "./data/map-slots";
import { getChanged } from "./get-changed";
import fdeq from "fast-deep-equal";
import { createIsSlotConfig } from "./data/is-slot";

export const cache: {
  lastChange: Record<string, any>;
} = { lastChange: {} };

export const resolveComponentData = async <
  T extends ComponentData | RootDataWithProps
>(
  item: T,
  config: Config,
  metadata: Metadata = {},
  onResolveStart?: (item: T) => void,
  onResolveEnd?: (item: T) => void,
  trigger: ResolveDataTrigger = "replace",
  recursive: boolean = true
) => {
  const configForItem =
    "type" in item && item.type !== "root"
      ? config.components[item.type]
      : config.root;

  if (configForItem?.resolveData && item.props) {
    const id = "id" in item.props ? item.props.id : "root";

    const { item: oldItem = null, resolved = {} } = cache.lastChange[id] || {};

    if (item && fdeq(item, oldItem)) {
      return { node: resolved, didChange: false };
    }

    const changed = getChanged(item, oldItem);

    if (onResolveStart) {
      onResolveStart(item);
    }

    const { props: resolvedProps, readOnly = {} } =
      await configForItem.resolveData(item, {
        changed,
        lastData: oldItem,
        metadata: { ...metadata, ...configForItem.metadata },
        trigger,
      });

    let resolvedItem = {
      ...item,
      props: {
        ...item.props,
        ...resolvedProps,
      },
    };

    if (recursive) {
      resolvedItem = (await mapSlotsAsync(
        resolvedItem,
        async (content) => {
          return Promise.all(
            content.map(
              async (childItem) =>
                (
                  await resolveComponentData(
                    childItem as T,
                    config,
                    metadata,
                    onResolveStart,
                    onResolveEnd,
                    trigger,
                    false
                  )
                ).node
            )
          );
        },
        false,
        createIsSlotConfig(config)
      )) as T;
    }

    if (Object.keys(readOnly).length) {
      resolvedItem.readOnly = readOnly;
    }

    cache.lastChange[id] = {
      item,
      resolved: resolvedItem,
    };

    if (onResolveEnd) {
      onResolveEnd(resolvedItem);
    }

    return { node: resolvedItem, didChange: !fdeq(item, resolvedItem) };
  }

  return { node: item, didChange: false };
};
