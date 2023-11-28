import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { DropZone } from "../../../DropZone";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { PluginRenderer } from "../..";
import { useCallback } from "react";
import { useAppContext } from "../../context";

const getClassName = getClassNameFactory("PuckPreview", styles);

export const Preview = ({ id = "puck-preview" }: { id?: string }) => {
  const { plugins, config, dispatch, state } = useAppContext();

  const Page = useCallback(
    (pageProps) => (
      <PluginRenderer
        plugins={plugins}
        renderMethod="renderRoot"
        dispatch={pageProps.dispatch}
        state={pageProps.state}
      >
        {config.root?.render
          ? config.root?.render({ ...pageProps, editMode: true })
          : pageProps.children}
      </PluginRenderer>
    ),
    [config.root]
  );

  // DEPRECATED
  const rootProps = state.data.root.props || state.data.root;

  return (
    <div className={getClassName()} id={id}>
      <Page dispatch={dispatch} state={state} {...rootProps}>
        <DropZone zone={rootDroppableId} />
      </Page>
    </div>
  );
};
