import { ReactNode, useMemo } from "react";

export const useDefaultRender = () => {
  return useMemo<React.FunctionComponent<{ children?: ReactNode }>>(() => {
    const PuckDefault = ({ children }: { children?: ReactNode }) => (
      <>{children}</>
    );

    return PuckDefault;
  }, []);
};
