import { useComponentList } from "../../../../lib/use-component-list";
import { useAppContext } from "../../context";
import { ComponentList } from "../../../ComponentList";

export const Components = () => {
  const { config, state } = useAppContext();

  const componentList = useComponentList(config, state.ui);

  return (
    <div>{componentList ? componentList : <ComponentList id="all" />}</div>
  );
};
