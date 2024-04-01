import { Monitor, Smartphone, Tablet, ZoomIn, ZoomOut } from "lucide-react";
import { IconButton } from "../IconButton";
import { useAppContext } from "../Puck/context";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { getClassNameFactory } from "../../lib";

import styles from "./styles.module.css";
import { Viewport } from "../../types/Viewports";

const icons = {
  Smartphone: <Smartphone size={16} />,
  Tablet: <Tablet size={16} />,
  Monitor: <Monitor size={16} />,
};

const getClassName = getClassNameFactory("ViewportControls", styles);
const getClassNameButton = getClassNameFactory("ViewportButton", styles);

const ViewportButton = ({
  children,
  height = "auto",
  title,
  width,
  onClick,
}: {
  children: ReactNode;
  height?: number | "auto";
  title: string;
  width: number;
  onClick: (viewport: Viewport) => void;
}) => {
  const { state } = useAppContext();

  const [isActive, setIsActive] = useState(false);

  // We use an effect so this doesn't cause hydration warnings with SSR
  useEffect(() => {
    setIsActive(width === state.ui.viewports.current.width);
  }, [width, state.ui.viewports.current.width]);

  return (
    <span className={getClassNameButton({ isActive })}>
      <IconButton
        title={title}
        disabled={isActive}
        onClick={(e) => {
          e.stopPropagation();
          onClick({ width, height });
        }}
      >
        <span className={getClassNameButton("inner")}>{children}</span>
      </IconButton>
    </span>
  );
};

// Based on Chrome dev tools
const defaultZoomOptions = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
  { label: "125%", value: 1.25 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2 },
];

export const ViewportControls = ({
  autoZoom,
  zoom,
  onViewportChange,
  onZoom,
}: {
  autoZoom: number;
  zoom: number;
  onViewportChange: (viewport: Viewport) => void;
  onZoom: (zoom: number) => void;
}) => {
  const { viewports } = useAppContext();

  const defaultsContainAutoZoom = defaultZoomOptions.find(
    (option) => option.value === autoZoom
  );

  const zoomOptions = useMemo(
    () =>
      [
        ...defaultZoomOptions,
        ...(defaultsContainAutoZoom
          ? []
          : [
              {
                value: autoZoom,
                label: `${(autoZoom * 100).toFixed(0)}% (Auto)`,
              },
            ]),
      ]
        .filter((a) => a.value <= autoZoom)
        .sort((a, b) => (a.value > b.value ? 1 : -1)),
    [autoZoom]
  );

  return (
    <div className={getClassName()}>
      {viewports.map((viewport, i) => (
        <ViewportButton
          key={i}
          height={viewport.height}
          width={viewport.width}
          title={
            viewport.label
              ? `Switch to ${viewport.label} viewport`
              : "Switch viewport"
          }
          onClick={onViewportChange}
        >
          {typeof viewport.icon === "string"
            ? icons[viewport.icon] || viewport.icon
            : viewport.icon || icons.Smartphone}
        </ViewportButton>
      ))}
      <div className={getClassName("divider")} />
      <IconButton
        title="Zoom viewport out"
        disabled={zoom <= zoomOptions[0]?.value}
        onClick={(e) => {
          e.stopPropagation();
          onZoom(
            zoomOptions[
              Math.max(
                zoomOptions.findIndex((option) => option.value === zoom) - 1,
                0
              )
            ].value
          );
        }}
      >
        <ZoomOut size={16} />
      </IconButton>
      <IconButton
        title="Zoom viewport in"
        disabled={zoom >= zoomOptions[zoomOptions.length - 1]?.value}
        onClick={(e) => {
          e.stopPropagation();

          onZoom(
            zoomOptions[
              Math.min(
                zoomOptions.findIndex((option) => option.value === zoom) + 1,
                zoomOptions.length - 1
              )
            ].value
          );
        }}
      >
        <ZoomIn size={16} />
      </IconButton>
      <div className={getClassName("divider")} />
      <select
        className={getClassName("zoomSelect")}
        value={zoom.toString()}
        onChange={(e) => {
          onZoom(parseFloat(e.currentTarget.value));
        }}
      >
        {zoomOptions.map((option) => (
          <option
            key={option.label}
            value={option.value}
            label={option.label}
          />
        ))}
      </select>
    </div>
  );
};
