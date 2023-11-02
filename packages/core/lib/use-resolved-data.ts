import { Config, Data } from "../types/Config";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { PuckAction } from "../reducer";
import { resolveAllProps } from "./resolve-all-props";
import { applyDynamicProps } from "./apply-dynamic-props";
import { resolveRootData } from "./resolve-root-data";

export const useResolvedData = (
  data: Data,
  config: Config,
  dispatch: Dispatch<PuckAction>
) => {
  const [runResolversKey, setRunResolversKey] = useState(0);

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

  const runResolvers = () => {
    // Flatten zones
    const flatContent = Object.keys(data.zones || {})
      .reduce((acc, zone) => [...acc, ...data.zones![zone]], data.content)
      .filter((item) => !!config.components[item.type].resolveData);

    resolveAllProps(
      flatContent,
      config,
      (item) => {
        setComponentLoading(item.props.id, true, 50);
      },
      (item) => {
        deferredSetStates[item.props.id];

        setComponentLoading(item.props.id, false);
      }
    ).then(async (dynamicContent) => {
      setComponentLoading("puck-root", true, 50);

      const dynamicRoot = await resolveRootData(data, config);

      setComponentLoading("puck-root", false);

      const newDynamicProps = dynamicContent.reduce<Record<string, any>>(
        (acc, item) => {
          return { ...acc, [item.props.id]: item };
        },
        {}
      );

      const processed = applyDynamicProps(data, newDynamicProps, dynamicRoot);

      const containsChanges =
        JSON.stringify(data) !== JSON.stringify(processed);

      if (containsChanges) {
        dispatch({
          type: "setData",
          data: (prev) => applyDynamicProps(prev, newDynamicProps, dynamicRoot),
          recordHistory: true,
        });
      }
    });
  };

  useEffect(() => {
    runResolvers();
  }, [runResolversKey]);

  return {
    resolveData: () => {
      setRunResolversKey((curr) => curr + 1);
    },
    componentState,
  };
};
