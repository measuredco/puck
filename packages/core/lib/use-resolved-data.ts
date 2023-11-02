import { ComponentData, Config, Data, RootData } from "../types/Config";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { PuckAction } from "../reducer";
import { resolveComponentData } from "./resolve-component-data";
import { applyDynamicProps } from "./apply-dynamic-props";
import { resolveRootData } from "./resolve-root-data";

export const useResolvedData = (
  data: Data,
  config: Config,
  dispatch: Dispatch<PuckAction>
) => {
  const [{ resolverKey, newData }, setResolverState] = useState({
    resolverKey: 0,
    newData: data,
  });

  const [componentState, setComponentState] = useState<
    Record<string, { loading }>
  >({});

  const deferredSetStates: Record<string, NodeJS.Timeout> = {};

  const setComponentLoading = useCallback(
    (id: string, loading: boolean, defer: number = 0) => {
      if (deferredSetStates[id]) {
        clearTimeout(deferredSetStates[id]);

        delete deferredSetStates[id];
      }

      const setLoading = (deferredSetStates[id] = setTimeout(() => {
        setComponentState((prev) => ({
          ...prev,
          [id]: { ...prev[id], loading },
        }));

        delete deferredSetStates[id];
      }, defer));
    },
    []
  );

  const runResolvers = async () => {
    // Flatten zones
    const flatContent = Object.keys(newData.zones || {})
      .reduce((acc, zone) => [...acc, ...newData.zones![zone]], newData.content)
      .filter((item) => !!config.components[item.type].resolveData);

    const applyIfChange = (
      dynamicDataMap: Record<string, ComponentData>,
      dynamicRoot?: RootData
    ) => {
      // Apply the dynamic content to `data`, not `newData`, in case `data` has been changed by the user
      const processed = applyDynamicProps(data, dynamicDataMap, dynamicRoot);

      const containsChanges =
        JSON.stringify(data) !== JSON.stringify(processed);

      if (containsChanges) {
        dispatch({
          type: "setData",
          data: (prev) => applyDynamicProps(prev, dynamicDataMap, dynamicRoot),
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

  const resolveData = useCallback((newData: Data = data) => {
    setResolverState((curr) => ({
      resolverKey: curr.resolverKey + 1,
      newData,
    }));
  }, []);

  return {
    resolveData,
    componentState,
  };
};
