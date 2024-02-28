import { DropZone, dropZoneContext } from "../../../DropZone";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { useCallback, useContext } from "react";
import { useAppContext } from "../../context";
import {
  DefaultComponentProps,
  DefaultRootProps,
} from "../../../../types/Config";

export const Preview = ({ id = "puck-preview" }: { id?: string }) => {
  const { config, dispatch, state } = useAppContext();

  const Page = useCallback(
    (pageProps: DefaultRootProps) => {
      return config.root?.render
        ? config.root?.render({
            ...pageProps,
            id: "puck-root",
            editMode: true,
            puck: { renderDropZone: DropZone },
          })
        : pageProps.children;
    },
    [config.root]
  );

  // DEPRECATED
  const rootProps = state.data.root.props || state.data.root;

  const { disableZoom = false } = useContext(dropZoneContext) || {};

  return (
    <div
      id={id}
      onClick={() => {
        dispatch({ type: "setUi", ui: { ...state.ui, itemSelector: null } });
      }}
      style={{ zoom: disableZoom ? 1 : 0.75 }}
    >
      <Page {...rootProps}>
        <DropZone zone={rootDroppableId} />
      </Page>
    </div>
  );
};
