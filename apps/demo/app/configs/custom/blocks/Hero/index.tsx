/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "core/types/Config";
import styles from "./styles.module.css";
import { getClassNameFactory } from "core/lib";
import { Button } from "core/Button";
import { Section } from "../../components/Section";

const getClassName = getClassNameFactory("Hero", styles);

export type HeroProps = {
  title: string;
  description: string;
  align?: string;
  padding: string;
  imageMode?: "inline" | "background";
  imageUrl?: string;
  buttons: { label: string; href: string; variant?: "primary" | "secondary" }[];
};

export const Hero: ComponentConfig<HeroProps> = {
  fields: {
    title: { type: "text" },
    description: { type: "textarea" },
    buttons: {
      type: "group",
      getItemSummary: (item) => item.label || "Button",
      groupFields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "primary", value: "primary" },
            { label: "secondary", value: "secondary" },
          ],
        },
      },
    },
    align: {
      type: "select",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
      ],
    },
    imageUrl: { type: "text" },
    imageMode: {
      type: "select",
      options: [
        { label: "inline", value: "inline" },
        { label: "background", value: "background" },
      ],
    },
    padding: { type: "text" },
  },
  defaultProps: {
    title: "Hero",
    description: "Description",
    buttons: [{ label: "Learn more", href: "#" }],
    padding: "64px",
  },
  render: ({
    align,
    title,
    description,
    buttons,
    padding,
    imageUrl,
    imageMode,
  }) => {
    return (
      <Section
        padding={padding}
        className={getClassName({ center: align === "center" })}
      >
        {imageMode === "background" && (
          <>
            <div
              className={getClassName("image")}
              style={{
                backgroundImage: `url("${imageUrl}")`,
              }}
            ></div>

            <div className={getClassName("imageOverlay")}></div>
          </>
        )}

        <div className={getClassName("inner")}>
          <div className={getClassName("content")}>
            <h1>{title}</h1>
            <p className={getClassName("subtitle")}>{description}</p>
            <div className={getClassName("actions")}>
              {buttons.map((button, i) => (
                <Button key={i} href={button.href} variant={button.variant}>
                  {button.label}
                </Button>
              ))}
            </div>
          </div>

          {align !== "center" && imageMode !== "background" && imageUrl && (
            <div
              style={{
                backgroundImage: `url('${imageUrl}')`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                borderRadius: 24,
                height: 356,
                width: 512,
                marginLeft: "auto",
              }}
            />
          )}
        </div>
      </Section>
    );
  },
};
