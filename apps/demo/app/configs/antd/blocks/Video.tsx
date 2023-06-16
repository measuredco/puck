import React from "react";
import { ComponentConfig } from "core/types/Config";

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
      type: "select",
      options: [
        { label: "On", value: "on" },
        { label: "Off", value: "off" },
      ],
    },
    loop: {
      type: "select",
      options: [
        { label: "On", value: "on" },
        { label: "Off", value: "off" },
      ],
    },
  },
  render: ({ autoplay, loop, src }) => {
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
            loop={loop === "on"}
            style={{
              height: "100%",
            }}
            autoPlay={autoplay === "on"}
          />
        </div>
      </div>
    );
  },
};
