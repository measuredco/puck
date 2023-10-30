import { Config, Data } from "../types/Config";
import { Dispatch, useEffect, useState } from "react";
import { PuckAction } from "../reducer";
import { resolveAllProps } from "./resolve-all-props";
import { applyDynamicProps } from "./apply-dynamic-props";

export const useResolvedData = (
  data: Data,
  config: Config,
  dispatch: Dispatch<PuckAction>
) => {
  const [runResolversKey, setRunResolversKey] = useState(0);

  const [componentState, setComponentState] = useState<
    Record<string, { loading }>
  >({});

  const runResolvers = () => {
    // Flatten zones
    const flatContent = Object.keys(data.zones || {})
      .reduce((acc, zone) => [...acc, ...data.zones![zone]], data.content)
      .filter((item) => !!config.components[item.type].resolveData);

    resolveAllProps(
      flatContent,
      config,
      (item) => {
        setComponentState((prev) => ({
          ...prev,
          [item.props.id]: { ...prev[item.props.id], loading: true },
        }));
      },
      (item) => {
        setComponentState((prev) => ({
          ...prev,
          [item.props.id]: { ...prev[item.props.id], loading: false },
        }));
      }
    ).then((dynamicContent) => {
      const newDynamicProps = dynamicContent.reduce<Record<string, any>>(
        (acc, item) => {
          return { ...acc, [item.props.id]: item };
        },
        {}
      );

      const processed = applyDynamicProps(data, newDynamicProps);

      const containsChanges =
        JSON.stringify(data) !== JSON.stringify(processed);

      if (containsChanges) {
        dispatch({
          type: "setData",
          data: (prev) => applyDynamicProps(prev, newDynamicProps),
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
