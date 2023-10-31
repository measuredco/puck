/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { ComponentConfig } from "@measured/puck/types/Config";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@measured/puck/lib";
import { Button } from "@measured/puck/components/Button";
import { Section } from "../../components/Section";
import { quotes } from "./quotes";

const getClassName = getClassNameFactory("Hero", styles);

export type HeroProps = {
  quote?: { index: number; label: string };
  title: string;
  description: string;
  align?: string;
  padding: string;
  imageMode?: "inline" | "background";
  imageUrl?: string;
  buttons: {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
    more?: { text: string }[];
  }[];
};

export const Hero: ComponentConfig<HeroProps> = {
  fields: {
    quote: {
      type: "external",
      placeholder: "Select a quote",
      fetchList: async () =>
        quotes.map((quote, idx) => ({
          index: idx,
          title: quote.author,
          description: quote.content,
        })),
      mapProp: (result) => {
        return { index: result.index, label: result.description };
      },
      getItemSummary: (item) => item.label,
    },
    title: { type: "text" },
    description: { type: "textarea" },
    buttons: {
      type: "array",
      getItemSummary: (item) => item.label || "Button",
      arrayFields: {
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
      type: "radio",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
      ],
    },
    imageUrl: { type: "text" },
    imageMode: {
      type: "radio",
      options: [
        { label: "inline", value: "inline" },
        { label: "background", value: "background" },
      ],
    },
    padding: { type: "text" },
  },
  defaultProps: {
    title: "Hero",
    align: "left",
    description: "Description",
    buttons: [{ label: "Learn more", href: "#" }],
    padding: "64px",
  },
  /**
   * The resolveData method allows us to modify component data after being
   * set by the user.
   *
   * It is called after the page data is changed, but before a component
   * is rendered. This allows us to make dynamic changes to the props
   * without storing the data in Puck.
   *
   * For example, requesting a third-party API for the latest content.
   */
  resolveData: async ({ props }, { changed }) => {
    if (!props.quote)
      return { props, readOnly: { title: false, description: false } };

    if (!changed.quote) {
      return { props };
    }

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      props: {
        title: quotes[props.quote.index].author,
        description: quotes[props.quote.index].content,
      },
      readOnly: { title: true, description: true },
    };
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
    // Empty state allows us to test that components support hooks
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [_] = useState(0);

    return (
      <Section
        padding={padding}
        className={getClassName({
          left: align === "left",
          center: align === "center",
          hasImageBackground: imageMode === "background",
        })}
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
          </div>

          {align !== "center" && imageMode !== "background" && imageUrl && (
            <div
              style={{
                backgroundImage: `url('${imageUrl}')`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                borderRadius: 24,
                height: 356,
                marginLeft: "auto",
                width: "100%",
              }}
            />
          )}
        </div>
      </Section>
    );
  },
};
