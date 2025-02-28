import { AppState, ComponentData, RootData } from "../types";
import { resolveComponentData } from "./resolve-component-data";
import { applyDynamicProps } from "./apply-dynamic-props";
import { resolveRootData } from "./resolve-root-data";
import { flattenData } from "./flatten-data";
import { AppStore } from "../store";
import fdeq from "fast-deep-equal";

export const resolveData = (newAppState: AppState, appStoreData: AppStore) => {
  const {
    state: appState,
    config,
    dispatch,
    resolveDataRuns,
    setComponentLoading,
    unsetComponentLoading,
    metadata,
    permissions,
  } = appStoreData;

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
        { ...appState.data },
        dynamicDataMap,
        dynamicRoot
      );

      const processedAppState = { ...appState, data: processed };

      const containsChanges = !fdeq(appState, processedAppState);

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

    const promises: Promise<void>[] = [];

    promises.push(
      (async () => {
        _setComponentLoading("puck-root", true, 50);

        const dynamicRoot = await resolveRootData(newData, config, metadata);

        applyIfChange({}, dynamicRoot);

        _setComponentLoading("puck-root", false);
      })()
    );

    flatContent.forEach((item) => {
      promises.push(
        (async () => {
          // Don't wait for resolver to complete to update permissions
          permissions.resolvePermissions({ item }, true);

          const dynamicData: ComponentData = await resolveComponentData(
            item,
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

          const dynamicDataMap = { [item.props.id]: dynamicData };

          applyIfChange(dynamicDataMap);
        })()
      );
    });

    await Promise.all(promises);
  };

  return runResolvers();
};
