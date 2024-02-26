import { DropZone, dropZoneContext } from "../../../DropZone";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { useCallback, useContext, useRef } from "react";
import { useAppContext } from "../../context";
import AutoFrame from "@measured/auto-frame-component";
import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";

const getClassName = getClassNameFactory("PuckPreview", styles);

export const Preview = ({ id = "puck-preview" }: { id?: string }) => {
  const { config, dispatch, state } = useAppContext();

  const Page = useCallback(
    (pageProps) =>
      config.root?.render
        ? config.root?.render({ ...pageProps, editMode: true })
        : pageProps.children,
    [config.root]
  );

  // DEPRECATED
  const rootProps = state.data.root.props || state.data.root;

  const { disableZoom = false } = useContext(dropZoneContext) || {};

  const ref = useRef<HTMLIFrameElement>(null);

  return (
    <div
      className={getClassName()}
      id={id}
      onClick={() => {
        dispatch({ type: "setUi", ui: { ...state.ui, itemSelector: null } });
      }}
    >
      <AutoFrame
        id="preview-iframe"
        className={getClassName("iframe")}
        data-rfd-iframe
        ref={ref}
      >
        <div style={{ zoom: disableZoom ? 1 : 0.75 }}>
          <Page dispatch={dispatch} state={state} {...rootProps}>
            <DropZone zone={rootDroppableId} />
          </Page>
        </div>
      </AutoFrame>
    </div>
  );
};
