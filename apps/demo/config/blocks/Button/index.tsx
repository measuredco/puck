import React from "react";
import { ComponentConfigFunction } from "@/core/types";
import { Button as _Button } from "@/core/components/Button";
import { Context } from "../../index";

export type ButtonProps = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

export const Button: ComponentConfigFunction<ButtonProps, Context> = (
  context
) => ({
  label: "Button",
  fields: {
    label: { type: "text", placeholder: "Lorem ipsum..." },
    href: { type: "text" },
    variant: {
      type: "radio",
      options: [
        { label: "primary", value: "primary" },
        { label: "secondary", value: "secondary" },
      ],
    },
  },
  defaultProps: {
    label: context?.package ?? "Button",
    href: "#",
    variant: "primary",
  },
  render: ({ href, variant, label, puck }) => {
    return (
      <div>
        <_Button
          href={puck.isEditing ? "#" : href}
          variant={variant}
          size="large"
          tabIndex={puck.isEditing ? -1 : undefined}
        >
          {label}
        </_Button>
      </div>
    );
  },
});
