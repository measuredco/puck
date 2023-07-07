/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@measured/puck/types/Config";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@measured/puck/lib";
import { Button } from "@measured/puck/components/Button";
import { Section } from "../../components/Section";
import createAdaptor from "@measured/puck-adaptor-fetch/index";

const getClassName = getClassNameFactory("Hero", styles);

export type HeroProps = {
  _data?: object;
  title: string;
  description: string;
  align?: string;
  padding: string;
  imageMode?: "inline" | "background";
  imageUrl?: string;
  buttons: { label: string; href: string; variant?: "primary" | "secondary" }[];
};

const quotesAdaptor = createAdaptor(
  "Quotes API",
  "https://api.quotable.io/quotes",
  (body) =>
    body.results.map((item) => ({
      ...item,
      title: item.author,
      description: item.content,
    }))
);

export const Hero: ComponentConfig<HeroProps> = {
  fields: {
    _data: {
      type: "external",
      adaptor: quotesAdaptor,
      adaptorParams: {
        resource: "movies",
        url: "http://localhost:1337",
        apiToken:
          "1fb8c347243145a8824481bd1008b95367677654ebc1f06c5a0a766e57b8859bcfde77f9b21405011f20eb8a13abb7b0ea3ba2393167ffc4a2cdc3828586494cc9983d5f1db4bc195ff4afb885aa55ee28a88ca796e7b883b9e9b80c98b50eadf79f5a1639ce8e2ae4cf63c2e8b8659a8cbbfeaa8e8adcce222b827eec49f989",
      },
      getItemSummary: (item: any) => item.content,
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
