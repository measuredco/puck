/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@puck/core/types/Config";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@puck/core/lib";
import { Button } from "@puck/core/Button";
import { Section } from "../../components/Section";

const getClassName = getClassNameFactory("ButtonGroup", styles);

export type ButtonGroupProps = {
  align?: string;
  buttons: { label: string; href: string; variant?: "primary" | "secondary" }[];
};

export const ButtonGroup: ComponentConfig<ButtonGroupProps> = {
  fields: {
    buttons: {
      type: "group",
      getItemSummary: (item) => item.label || "Button",
      groupFields: {
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
    buttons: [{ label: "Learn more", href: "#" }],
  },
  render: ({ align, buttons }) => {
    return (
      <Section className={getClassName({ center: align === "center" })}>
        <div className={getClassName("actions")}>
          {buttons.map((button, i) => (
            <Button key={i} href={button.href} variant={button.variant}>
              {button.label}
            </Button>
          ))}
        </div>
      </Section>
    );
  },
};
