import { useMemo } from "react";
import { loadOverrides } from "./load-overrides";
import { Overrides, Plugin } from "../types";

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
