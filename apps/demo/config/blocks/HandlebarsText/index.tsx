import React from "react";

import { ComponentConfig } from "@/core";
import { Section } from "../../components/Section";
import { WithLayout, withLayout } from "../../components/Layout";
import processPropsHandlebars from "../../../lib/process-props-handlebars";

export type HandlebarsTextProps = WithLayout<{
  align: "left" | "center" | "right";
  text?: string;
  padding?: string;
  size?: "s" | "m";
  color: "default" | "muted";
  maxWidth?: string;
}>;

const HandlebarsTextInner: ComponentConfig<HandlebarsTextProps> = {
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
    maxWidth: { type: "text" },
  },
  defaultProps: {
    align: "left",
    text: "{{text}}",
    size: "m",
    color: "default",
  },
  beforeRender: ({ props }, { externalData }) => {
    const processedProps = processPropsHandlebars(props, externalData)
    return {
      props: processedProps,
    };
  },
  render: ({ align, color, text, size, maxWidth }) => {
    return (
      <Section maxWidth={maxWidth}>
        <span
          style={{
            color:
              color === "default" ? "inherit" : "var(--puck-color-grey-05)",
            display: "flex",
            textAlign: align,
            width: "100%",
            fontSize: size === "m" ? "20px" : "16px",
            fontWeight: 300,
            maxWidth,
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

export const HandlebarsText = withLayout(HandlebarsTextInner);
