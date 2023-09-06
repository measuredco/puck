import React from "react";

import { ComponentConfig } from "@measured/puck";
import { Button, Stack } from "@mui/material";
import { Container, ContainerProps, containerFields } from "../Container";

export type ButtonGroupProps = {
  buttons: {
    variant: "text" | "outlined" | "contained";
    label: string;
    href: string;
  }[];
  align: "flex-start" | "center" | "flex-end";
} & ContainerProps;

export const ButtonGroup: ComponentConfig<ButtonGroupProps> = {
  fields: {
    buttons: {
      type: "array",
      getItemSummary: (item) => item.label || "Button",
      arrayFields: {
        variant: {
          type: "radio",
          options: [
            { value: "text", label: "text" },
            { value: "outlined", label: "outlined" },
            { value: "contained", label: "contained" },
          ],
        },
        label: {
          type: "text",
        },
        href: {
          type: "text",
        },
      },
    },
    align: {
      type: "radio",
      options: [
        { value: "flex-start", label: "left" },
        { value: "center", label: "center" },
        { value: "flex-end", label: "right" },
      ],
    },
    ...containerFields,
  },
  defaultProps: {
    buttons: [{ variant: "contained", label: "Button", href: "#" }],
    align: "center",
  },
  render: ({ buttons, align, ...props }) => {
    return (
      <Container {...props}>
        <Stack direction="row" justifyContent={align} spacing={2}>
          {buttons.map((button, i) => (
            <Button key={i} variant={button.variant} href={button.href}>
              {button.label}
            </Button>
          ))}
        </Stack>
      </Container>
    );
  },
};
