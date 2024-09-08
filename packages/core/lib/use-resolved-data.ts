import { AppState, ComponentData, Config, RootData } from "../types";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { PuckAction } from "../reducer";
import { resolveComponentData } from "./resolve-component-data";
import { applyDynamicProps } from "./apply-dynamic-props";
import { resolveRootData } from "./resolve-root-data";
import { flattenData } from "./flatten-data";
import { AppContext } from "../components/Puck/context";
import { RefreshPermissions } from "./use-resolved-permissions";

export const useResolvedData = (
  appState: AppState,
  config: Config,
  dispatch: Dispatch<PuckAction>,
  setComponentLoading: (id: string) => void,
  unsetComponentLoading: (id: string) => void,
  refreshPermissions: RefreshPermissions
) => {
  const [{ resolverKey, newAppState }, setResolverState] = useState({
    resolverKey: 0,
    newAppState: appState,
  });

  const deferredSetStates: Record<string, NodeJS.Timeout> = {};

  const _setComponentLoading = useCallback(
    (id: string, loading: boolean, defer: number = 0) => {
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
    },
    []
  );

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
        _setComponentLoading("puck-root", true, 50);

        const dynamicRoot = await resolveRootData(newData, config);

        applyIfChange({}, dynamicRoot);

        _setComponentLoading("puck-root", false);
      })()
    );

    flatContent.forEach((item) => {
      promises.push(
        (async () => {
          // Don't wait for resolver to complete to update permissions
          refreshPermissions({ item });

          const dynamicData: ComponentData = await resolveComponentData(
            item,
            config,
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
  };
};
