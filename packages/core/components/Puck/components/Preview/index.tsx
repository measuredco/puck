import { DropZone } from "../../../DropZone";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { ReactNode, useCallback, useMemo, useRef } from "react";
import { useAppContext } from "../../context";
import AutoFrame from "../../../AutoFrame";
import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { DefaultRootProps } from "../../../../types/Config";
import { FrameContextConsumer } from "react-frame-component";

const getClassName = getClassNameFactory("PuckPreview", styles);

type PageProps = DefaultRootProps & { children: ReactNode };

export const Preview = ({ id = "puck-preview" }: { id?: string }) => {
  const { config, dispatch, state, setStatus, iframe, overrides } =
    useAppContext();

  const Page = useCallback<React.FC<PageProps>>(
    (pageProps) =>
      config.root?.render ? (
        config.root?.render({
          id: "puck-root",
          ...pageProps,
          editMode: true, // DEPRECATED
          puck: { renderDropZone: DropZone, isEditing: true },
        })
      ) : (
        <>{pageProps.children}</>
      ),
    [config.root]
  );

  const Frame = useMemo(() => overrides.iframe || "div", [overrides]);

  // DEPRECATED
  const rootProps = state.data.root.props || state.data.root;

  const ref = useRef<HTMLIFrameElement>(null);

  return (
    <div
      className={getClassName()}
      id={id}
      onClick={() => {
        dispatch({ type: "setUi", ui: { ...state.ui, itemSelector: null } });
      }}
    >
      {iframe.enabled ? (
        <AutoFrame
          id="preview-frame"
          className={getClassName("frame")}
          data-rfd-iframe
          ref={ref}
          onStylesLoaded={() => {
            setStatus("READY");
          }}
        >
          <FrameContextConsumer>
            {({ document }) => {
              return (
                <Frame document={document}>
                  <Page dispatch={dispatch} state={state} {...rootProps}>
                    <DropZone zone={rootDroppableId} />
                  </Page>
                </Frame>
              );
            }}
          </FrameContextConsumer>
        </AutoFrame>
      ) : (
        <div id="preview-frame" className={getClassName("frame")}>
          <Page dispatch={dispatch} state={state} {...rootProps}>
            <DropZone zone={rootDroppableId} />
          </Page>
        </div>
      )}
    </div>
  );
};
