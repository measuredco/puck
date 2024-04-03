import { getBox } from "css-box-model";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppContext } from "../../context";
import { ViewportControls } from "../../../ViewportControls";
import styles from "./styles.module.css";
import { getClassNameFactory } from "../../../../lib";
import { Preview } from "../Preview";
import { getZoomConfig } from "../../../../lib/get-zoom-config";
import { AppState } from "../../../../types/Config";

const getClassName = getClassNameFactory("PuckCanvas", styles);

const ZOOM_ON_CHANGE = true;

export const Canvas = () => {
  const { status, iframe } = useAppContext();
  const { dispatch, state, overrides, setUi, zoomConfig, setZoomConfig } =
    useAppContext();
  const { ui } = state;
  const frameRef = useRef<HTMLDivElement>(null);

  const [showTransition, setShowTransition] = useState(false);

  const defaultRender = useMemo<
    React.FunctionComponent<{ children?: ReactNode }>
  >(() => {
    const PuckDefault = ({ children }: { children?: ReactNode }) => (
      <>{children}</>
    );

    return PuckDefault;
  }, []);

  const CustomPreview = useMemo(
    () => overrides.preview || defaultRender,
    [overrides]
  );

  const getFrameDimensions = useCallback(() => {
    if (frameRef.current) {
      const frame = frameRef.current;

      const box = getBox(frame);

      return { width: box.contentBox.width, height: box.contentBox.height };
    }

    return { width: 0, height: 0 };
  }, [frameRef]);

  const resetAutoZoom = useCallback(
    (ui: AppState["ui"] = state.ui) => {
      if (frameRef.current) {
        setZoomConfig(
          getZoomConfig(ui.viewports.current, frameRef.current, zoomConfig.zoom)
        );
      }
    },
    [frameRef, zoomConfig, state.ui]
  );

  // Auto zoom
  useEffect(() => {
    setShowTransition(false);
    resetAutoZoom();
  }, [frameRef, ui.leftSideBarVisible, ui.rightSideBarVisible]);

  // Constrain height
  useEffect(() => {
    const { height: frameHeight } = getFrameDimensions();

    if (ui.viewports.current.height === "auto") {
      setZoomConfig({
        ...zoomConfig,
        rootHeight: frameHeight / zoomConfig.zoom,
      });
    }
  }, [zoomConfig.zoom]);

  // Resize based on window size
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      setShowTransition(false);
      resetAutoZoom();
    });

    if (document.body) {
      observer.observe(document.body);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={getClassName({
        ready: status === "READY" || !iframe.enabled,
      })}
      onClick={() =>
        dispatch({
          type: "setUi",
          ui: { itemSelector: null },
          recordHistory: true,
        })
      }
    >
      {ui.viewports.controlsVisible && iframe.enabled && (
        <div className={getClassName("controls")}>
          <ViewportControls
            autoZoom={zoomConfig.autoZoom}
            zoom={zoomConfig.zoom}
            onViewportChange={(viewport) => {
              setShowTransition(true);

              const uiViewport = {
                ...viewport,
                height: viewport.height || "auto",
                zoom: zoomConfig.zoom,
              };

              const newUi = {
                ...ui,
                viewports: { ...ui.viewports, current: uiViewport },
              };

              setUi(newUi);

              if (ZOOM_ON_CHANGE) {
                resetAutoZoom(newUi);
              }
            }}
            onZoom={(zoom) => {
              setShowTransition(true);

              setZoomConfig({ ...zoomConfig, zoom });
            }}
          />
        </div>
      )}
      <div className={getClassName("inner")} ref={frameRef}>
        <div
          className={getClassName("root")}
          style={{
            width: iframe.enabled ? ui.viewports.current.width : "100%",
            height: zoomConfig.rootHeight,
            transform: iframe.enabled ? `scale(${zoomConfig.zoom})` : undefined,
            transition: showTransition
              ? "width 150ms ease-out, height 150ms ease-out, transform 150ms ease-out"
              : "",
            overflow: iframe.enabled ? undefined : "auto",
          }}
          suppressHydrationWarning // Suppress hydration warning as frame is not visible until after load
        >
          <CustomPreview>
            <Preview />
          </CustomPreview>
        </div>
      </div>
    </div>
  );
};
