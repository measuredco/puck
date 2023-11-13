import React from "react";

import { ComponentConfig } from "@/core";
import { Section } from "../../components/Section";

export type TextProps = {
  align: "left" | "center" | "right";
  text?: string;
  padding?: string;
  size?: "s" | "m";
  color: "default" | "muted";
  maxWidth?: string;
};

export const Text: ComponentConfig<TextProps> = {
  fields: {
    text: { type: "textarea" },
    size: {
      type: "select",
      options: [
        { label: "S", value: "s" },
        { label: "M", value: "m" },
      ],
    },
    align: {
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    color: {
      type: "radio",
      options: [
        { label: "Default", value: "default" },
        { label: "Muted", value: "muted" },
      ],
    },
    padding: { type: "text" },
    maxWidth: { type: "text" },
  },
  defaultProps: {
    align: "left",
    text: "Text",
    padding: "24px",
    size: "m",
    color: "default",
  },
  render: ({ align, color, text, size, padding, maxWidth }) => {
    return (
      <Section padding={padding} maxWidth={maxWidth}>
        <span
          style={{
            color: color === "default" ? "inherit" : "var(--puck-color-grey-4)",
            display: "flex",
            textAlign: align,
            width: "100%",
            fontSize: size === "m" ? "20px" : "16px",
            fontWeight: 300,
            maxWidth,
            marginLeft: "auto",
            marginRight: "auto",
            justifyContent:
              align === "center"
                ? "center"
                : align === "right"
                ? "flex-end"
                : "flex-start",
          }}
        >
          {text}
        </span>
      </Section>
    );
  },
};
