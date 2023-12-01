import { useComponentList } from "../../../../lib/use-component-list";
import { useAppContext } from "../../context";
import { ComponentList } from "../../../ComponentList";
import { useMemo } from "react";

export const Components = () => {
  const { config, state, customUi } = useAppContext();

  const componentList = useComponentList(config, state.ui);

  const Wrapper = useMemo(() => customUi.componentList || "div", [customUi]);

  return (
    <Wrapper>
      {componentList ? componentList : <ComponentList id="all" />}
    </Wrapper>
  );
};
