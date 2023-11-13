/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@/core/types/Config";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { Button } from "@/core/components/Button";
import { Section } from "../../components/Section";

const getClassName = getClassNameFactory("ButtonGroup", styles);

export type ButtonGroupProps = {
  align?: string;
  buttons: { label: string; href: string; variant: "primary" | "secondary" }[];
};

export const ButtonGroup: ComponentConfig<ButtonGroupProps> = {
  fields: {
    buttons: {
      type: "array",
      getItemSummary: (item) => item.label || "Button",
      arrayFields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "radio",
          options: [
            { label: "primary", value: "primary" },
            { label: "secondary", value: "secondary" },
          ],
        },
      },
      defaultItemProps: {
        label: "Button",
        href: "#",
        variant: "primary",
      },
    },
    align: {
      type: "radio",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
      ],
    },
  },
  defaultProps: {
    buttons: [{ label: "Learn more", href: "#", variant: "primary" }],
  },
  render: ({ align, buttons }) => {
    return (
      <Section className={getClassName({ center: align === "center" })}>
        <div className={getClassName("actions")}>
          {buttons.map((button, i) => (
            <Button
              key={i}
              href={button.href}
              variant={button.variant}
              size="large"
            >
              {button.label}
            </Button>
          ))}
        </div>
      </Section>
    );
  },
};
