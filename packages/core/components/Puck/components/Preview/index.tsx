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

export class BubbledPointerEvent extends window.PointerEvent {
  originalTarget: EventTarget | null;

  constructor(
    type: string,
    data: PointerEvent & { originalTarget: EventTarget | null }
  ) {
    super(type, data);

    this.originalTarget = data.originalTarget;
  }
}

const useBubbleIframeEvents = (ref: RefObject<HTMLIFrameElement | null>) => {
  const { status } = useAppContext();

  useEffect(() => {
    if (ref.current && status === "READY") {
      const iframe = ref.current;

      const handlePointerMove = (event: PointerEvent) => {
        const evt = new BubbledPointerEvent("pointermove", {
          ...event,
          bubbles: true,
          cancelable: false,
          clientX: event.clientX,
          clientY: event.clientY,
          originalTarget: event.target,
        });

        iframe.dispatchEvent(evt);
      };

      // Add event listeners
      iframe.contentDocument?.addEventListener(
        "pointermove",
        handlePointerMove,
        {
          capture: true,
        }
      );

      return () => {
        // Clean up event listeners
        iframe.contentDocument?.removeEventListener(
          "pointermove",
          handlePointerMove
        );
      };
    }
  }, [status]);
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
      data-puck-preview
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
        <div
          id="preview-frame"
          className={getClassName("frame")}
          ref={ref}
          data-puck-entry
        >
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
