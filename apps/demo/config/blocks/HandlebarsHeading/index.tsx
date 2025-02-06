import React from "react";

import { ComponentConfig } from "@/core";
import { Heading as _Heading } from "@/core/components/Heading";
import type { HeadingProps as _HeadingProps } from "@/core/components/Heading";
import { Section } from "../../components/Section";
import { WithLayout, withLayout } from "../../components/Layout";
import processPropsHandlebars from "../../../lib/process-props-handlebars";

export type HandlebarsHeadingProps = WithLayout<{
  align: "left" | "center" | "right";
  text?: string;
  level?: _HeadingProps["rank"];
  size: _HeadingProps["size"];
}>;

const sizeOptions = [
  { value: "xxxl", label: "XXXL" },
  { value: "xxl", label: "XXL" },
  { value: "xl", label: "XL" },
  { value: "l", label: "L" },
  { value: "m", label: "M" },
  { value: "s", label: "S" },
  { value: "xs", label: "XS" },
];

const levelOptions = [
  { label: "", value: "" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
];

const HandlebarsHeadingInternal: ComponentConfig<HandlebarsHeadingProps> = {
  fields: {
    text: {
      type: "textarea",
    },
    size: {
      type: "select",
      options: sizeOptions,
    },
    level: {
      type: "select",
      options: levelOptions,
    },
    align: {
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
  },
  defaultProps: {
    align: "left",
    text: "{{heading}}",
    size: "m",
    layout: {
      padding: "8px",
    },
  },
  beforeRender: ({ props }, { externalData }) => {
    const processedProps = processPropsHandlebars(props, externalData)
    return {
      props: processedProps,
    };
  },
  render: ({ align, text, size, level }) => {
    return (
      <Section>
        <_Heading size={size} rank={level as any}>
          <span style={{ display: "block", textAlign: align, width: "100%" }}>
            {text}
          </span>
        </_Heading>
      </Section>
    );
  },
};

export const HandlebarsHeading = withLayout(HandlebarsHeadingInternal);
