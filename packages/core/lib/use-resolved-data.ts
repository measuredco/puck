import { AppState, ComponentData, Config, RootData } from "../types/Config";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { PuckAction } from "../reducer";
import { resolveComponentData } from "./resolve-component-data";
import { applyDynamicProps } from "./apply-dynamic-props";
import { resolveRootData } from "./resolve-root-data";

export const useResolvedData = (
  appState: AppState,
  config: Config,
  dispatch: Dispatch<PuckAction>
) => {
  const [{ resolverKey, newAppState }, setResolverState] = useState({
    resolverKey: 0,
    newAppState: appState,
  });

  const [componentState, setComponentState] = useState<
    Record<string, { loading: boolean }>
  >({});

  const deferredSetStates: Record<string, NodeJS.Timeout> = {};

  const setComponentLoading = useCallback(
    (id: string, loading: boolean, defer: number = 0) => {
      if (deferredSetStates[id]) {
        clearTimeout(deferredSetStates[id]);

        delete deferredSetStates[id];
      }

      deferredSetStates[id] = setTimeout(() => {
        setComponentState((prev) => ({
          ...prev,
          [id]: { ...prev[id], loading },
        }));

        delete deferredSetStates[id];
      }, defer);
    },
    []
  );

  const runResolvers = async () => {
    // Flatten zones
    const newData = newAppState.data;

    const flatContent = Object.keys(newData.zones || {})
      .reduce((acc, zone) => [...acc, ...newData.zones![zone]], newData.content)
      .filter((item) => !!config.components[item.type].resolveData);

    const applyIfChange = (
      dynamicDataMap: Record<string, ComponentData>,
      dynamicRoot?: RootData
    ) => {
      // Apply the dynamic content to `data`, not `newData`, in case `data` has been changed by the user
      const processed = applyDynamicProps(
        appState.data,
        dynamicDataMap,
        dynamicRoot
      );

      const processedAppState = { ...appState, data: processed };

      const containsChanges =
        JSON.stringify(appState) !== JSON.stringify(processedAppState);

      if (containsChanges) {
        dispatch({
          type: "set",
          state: (prev) => ({
            ...prev,
            data: applyDynamicProps(prev.data, dynamicDataMap, dynamicRoot),
            ui: resolverKey > 0 ? { ...prev.ui, ...newAppState.ui } : prev.ui,
          }),
          recordHistory: resolverKey > 0,
        });
      }
    };

    const promises: Promise<void>[] = [];

    promises.push(
      (async () => {
        setComponentLoading("puck-root", true, 50);

        const dynamicRoot = await resolveRootData(newData, config);

        applyIfChange({}, dynamicRoot);

        setComponentLoading("puck-root", false);
      })()
    );

    flatContent.forEach((item) => {
      promises.push(
        (async () => {
          const dynamicData: ComponentData = await resolveComponentData(
            item,
            config,
            (item) => {
              setComponentLoading(item.props.id, true, 50);
            },
            (item) => {
              deferredSetStates[item.props.id];

              setComponentLoading(item.props.id, false);
            }
          );

          const dynamicDataMap = { [item.props.id]: dynamicData };

          applyIfChange(dynamicDataMap);
        })()
      );
    });

    await Promise.all(promises);
  };

  useEffect(() => {
    runResolvers();
  }, [resolverKey]);

  const resolveData = useCallback((newAppState: AppState = appState) => {
    setResolverState((curr) => ({
      resolverKey: curr.resolverKey + 1,
      newAppState,
    }));
  }, []);

  return {
    resolveData,
    componentState,
  };
};
