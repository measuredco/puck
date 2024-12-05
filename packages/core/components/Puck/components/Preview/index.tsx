import { DropZone } from "../../../DropZone";
import { rootDroppableId } from "../../../../lib/root-droppable-id";
import { RefObject, useCallback, useEffect, useRef, useMemo } from "react";
import { useAppContext } from "../../context";
import AutoFrame, { autoFrameContext } from "../../../AutoFrame";
import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { DefaultRootRenderProps } from "../../../../types";

const getClassName = getClassNameFactory("PuckPreview", styles);

type PageProps = DefaultRootRenderProps;

const useBubbleIframeEvents = (ref: RefObject<HTMLIFrameElement>) => {
  useEffect(() => {
    if (ref.current) {
      const iframe = ref.current;

      const onLoad = () => {
        // NB pointermove doesn't trigger whilst dragging on iframes
        iframe.contentWindow?.addEventListener("mousemove", function (event) {
          const rect = iframe.getBoundingClientRect();

          // NB this is a different event
          const evt = new CustomEvent("pointermove", {
            bubbles: true,
            cancelable: false,
          }) as any;

          const scaleFactor =
            rect.width / (iframe.contentWindow?.innerWidth || 1);

          evt.clientX = event.clientX * scaleFactor + rect.left;
          evt.clientY = event.clientY * scaleFactor + rect.top;

          iframe.dispatchEvent(evt);
        });
      };

      iframe.addEventListener("load", onLoad);

      return () => {
        iframe.removeEventListener("load", onLoad);
      };
    }
  }, [ref]);
};

export const Preview = ({ id = "puck-preview" }: { id?: string }) => {
  const { config, dispatch, state, setStatus, iframe, overrides } =
    useAppContext();

  const Page = useCallback<React.FC<PageProps>>(
    (pageProps) =>
      config.root?.render ? (
        config.root?.render({
          id: "puck-root",
          ...pageProps,
        })
      ) : (
        <>{pageProps.children}</>
      ),
    [config.root]
  );

  const Frame = useMemo(() => overrides.iframe, [overrides]);

  // DEPRECATED
  const rootProps = state.data.root.props || state.data.root;

  const ref = useRef<HTMLIFrameElement>(null);

  useBubbleIframeEvents(ref);

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
          onStylesLoaded={() => {
            setStatus("READY");
          }}
          frameRef={ref}
        >
          <autoFrameContext.Consumer>
            {({ document }) => {
              const inner = (
                <Page
                  {...rootProps}
                  puck={{
                    renderDropZone: DropZone,
                    isEditing: true,
                    dragRef: null,
                  }}
                  editMode={true} // DEPRECATED
                >
                  <DropZone zone={rootDroppableId} />
                </Page>
              );

              if (Frame) {
                return <Frame document={document}>{inner}</Frame>;
              }

              return inner;
            }}
          </autoFrameContext.Consumer>
        </AutoFrame>
      ) : (
        <div id="preview-frame" className={getClassName("frame")} ref={ref}>
          <Page
            {...rootProps}
            puck={{ renderDropZone: DropZone, isEditing: true, dragRef: null }}
            editMode={true} // DEPRECATED
          >
            <DropZone zone={rootDroppableId} />
          </Page>
        </div>
      )}
    </div>
  );
};
