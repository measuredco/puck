import { AppState, ComponentData, RootData } from "../types";
import { resolveComponentData } from "./resolve-component-data";
import { applyDynamicProps } from "./apply-dynamic-props";
import { resolveRootData } from "./resolve-root-data";
import { flattenData } from "./flatten-data";
import { AppStore } from "../store";
import fdeq from "fast-deep-equal";

export const resolveData = (
  newAppState: AppState,
  getAppStore: () => AppStore
) => {
  const {
    config,
    dispatch,
    resolveDataRuns,
    setComponentLoading,
    unsetComponentLoading,
    metadata,
  } = getAppStore();

  const deferredSetStates: Record<string, NodeJS.Timeout> = {};

  const _setComponentLoading = (
    id: string,
    loading: boolean,
    defer: number = 0
  ) => {
    if (deferredSetStates[id]) {
      clearTimeout(deferredSetStates[id]);

      delete deferredSetStates[id];
    }

    deferredSetStates[id] = setTimeout(() => {
      if (loading) {
        setComponentLoading(id);
      } else {
        unsetComponentLoading(id);
      }

      delete deferredSetStates[id];
    }, defer);
  };

  const runResolvers = async () => {
    // Flatten zones
    const newData = newAppState.data;

    const flatContent = flattenData(newData).filter(
      (item) => !!config.components[item.type]?.resolveData
    );

    const applyIfChange = (
      dynamicDataMap: Record<string, ComponentData>,
      dynamicRoot?: RootData
    ) => {
      // Apply the dynamic content to `data`, not `newData`, in case `data` has been changed by the user
      const processed = applyDynamicProps(
        getAppStore().state.data,
        dynamicDataMap,
        dynamicRoot
      );

      const containsChanges = !fdeq(getAppStore().state.data, processed);

      if (containsChanges) {
        dispatch({
          type: "set",
          state: (prev) => ({
            ...prev,
            data: applyDynamicProps(prev.data, dynamicDataMap, dynamicRoot),
            ui:
              resolveDataRuns > 0 ? { ...prev.ui, ...newAppState.ui } : prev.ui,
          }),
          recordHistory: resolveDataRuns > 0,
        });
      }
    };

    let latestState = newAppState;

    const promises: Promise<void>[] = [];

    promises.push(
      (async () => {
        _setComponentLoading("puck-root", true, 50);

        const dynamicRoot = await resolveRootData(newData, config, metadata);

        applyIfChange({}, dynamicRoot);

        _setComponentLoading("puck-root", false);

        latestState = getAppStore().state;
      })()
    );

    for (let i = flatContent.length - 1; i >= 0; i--) {
      const item = flatContent[i];

      const latestFlatContent = flattenData(latestState.data);

      const latestItem = latestFlatContent.find(
        (candidate) => candidate.props.id === item.props.id
      );

      const configForItem = config.components[item.type];

      const mergedProps = Object.keys(configForItem.fields || {}).reduce(
        (acc, fieldKey) => {
          const field = configForItem.fields![fieldKey];

          if (field.type === "slot") {
            return { ...acc, [fieldKey]: latestItem?.props[fieldKey] };
          }

          return acc;
        },
        item.props
      );

      const mergedItem = {
        ...item,
        props: mergedProps,
      };

      if (item) {
        const dynamicData: ComponentData = await resolveComponentData(
          mergedItem,
          config,
          metadata,
          (item) => {
            _setComponentLoading(item.props.id, true, 50);
          },
          (item) => {
            deferredSetStates[item.props.id];

            _setComponentLoading(item.props.id, false);
          }
        );

        applyIfChange({ [item.props.id]: dynamicData });

        latestState = getAppStore().state;
      }
    }
  };

  return runResolvers();
};
