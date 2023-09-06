import React from "react";
import { ComponentConfig } from "@measured/puck";

export type VideoProps = {
  autoplay: "on" | "off";
  loop: "on" | "off";
  src: string;
};

export const Video: ComponentConfig<VideoProps> = {
  fields: {
    src: {
      type: "text",
    },
    autoplay: {
      type: "radio",
      options: [
        { label: "On", value: "on" },
        { label: "Off", value: "off" },
      ],
    },
    loop: {
      type: "radio",
      options: [
        { label: "On", value: "on" },
        { label: "Off", value: "off" },
      ],
    },
  },
  render: ({ autoplay = "on", loop = "on", src }) => {
    return (
      <div style={{ background: "white" }}>
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <video
            src={src}
            loop={loop !== "off"}
            style={{
              height: "100%",
            }}
            autoPlay={autoplay !== "off"}
            muted
          />
        </div>
      </div>
    );
  },
};
