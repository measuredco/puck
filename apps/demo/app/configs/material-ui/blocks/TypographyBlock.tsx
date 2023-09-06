import React from "react";

import { ComponentConfig } from "@measured/puck";
import { Typography, TypographyVariant } from "@mui/material";
import { ContainerProps, Container, containerFields } from "../Container";

export type TypographyBlockProps = {
  align: "left" | "center" | "right";
  text?: string;
  variant: TypographyVariant;
  component?: any;
} & ContainerProps;

const variantOptions = [
  { label: "", value: "" },
  { label: "h1", value: "h1" },
  { label: "h2", value: "h2" },
  { label: "h3", value: "h3" },
  { label: "h4", value: "h4" },
  { label: "h5", value: "h5" },
  { label: "h6", value: "h6" },
  { label: "subtitle1", value: "subtitle1" },
  { label: "subtitle2", value: "subtitle2" },
  { label: "body1", value: "body1" },
  { label: "body2", value: "body2" },
  { label: "caption", value: "caption" },
  { label: "button", value: "button" },
  { label: "overline", value: "overline" },
];

const componentOptions = [
  { label: "", value: "" },
  { label: "h1", value: "h1" },
  { label: "h2", value: "h2" },
  { label: "h3", value: "h3" },
  { label: "h4", value: "h4" },
  { label: "h5", value: "h5" },
  { label: "h6", value: "h6" },
  { label: "p", value: "p" },
  { label: "div", value: "p" },
  { label: "span", value: "span" },
];

export const TypographyBlock: ComponentConfig<TypographyBlockProps> = {
  fields: {
    text: { type: "textarea" },
    variant: {
      type: "select",
      options: variantOptions,
    },
    align: {
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    component: {
      type: "select",
      options: componentOptions,
    },
    ...containerFields,
  },
  defaultProps: { align: "left", variant: "h2", text: "Text" },
  render: ({ align, text, variant, component, ...props }) => {
    return (
      <Container {...props}>
        <Typography align={align} variant={variant} component={component}>
          {variant === "h1" ||
          variant === "h2" ||
          variant === "h3" ||
          variant === "h4" ? (
            <b>{text}</b>
          ) : (
            text
          )}
        </Typography>
      </Container>
    );
  },
};
