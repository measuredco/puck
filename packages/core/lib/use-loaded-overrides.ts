import { useMemo } from "react";
import { loadOverrides } from "./load-overrides";
import { Plugin } from "../types/Plugin";
import { Overrides } from "../types/Overrides";

export const useLoadedOverrides = ({
  overrides,
  plugins,
}: {
  overrides?: Partial<Overrides>;
  plugins?: Plugin[];
}) => {
  return useMemo(() => {
    return loadOverrides({ overrides, plugins });
  }, [plugins, overrides]);
};
