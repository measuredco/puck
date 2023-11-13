/* eslint-disable @next/next/no-img-element */
import React from "react";
import { ComponentConfig } from "@/core";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { Section } from "../../components/Section";
import * as reactFeather from "react-feather";

const getClassName = getClassNameFactory("FeatureList", styles);

const icons = Object.keys(reactFeather).reduce((acc, iconName) => {
  if (typeof reactFeather[iconName] === "object") {
    const El = reactFeather[iconName];

    return {
      ...acc,
      [iconName]: <El />,
    };
  }

  return acc;
}, {});

const iconOptions = Object.keys(reactFeather).map((iconName) => ({
  label: iconName,
  value: iconName,
}));

export type FeatureListProps = {
  items: {
    title: string;
    description: string;
    icon?: "Feather";
  }[];
  mode: "flat" | "card";
};

export const FeatureList: ComponentConfig<FeatureListProps> = {
  fields: {
    items: {
      type: "array",
      getItemSummary: (item, i) => item.title || `Feature #${i}`,
      defaultItemProps: {
        title: "Title",
        description: "Description",
        icon: "Feather",
      },
      arrayFields: {
        title: { type: "text" },
        description: { type: "textarea" },
        icon: {
          type: "select",
          options: iconOptions,
        },
      },
    },
    mode: {
      type: "radio",
      options: [
        { label: "flat", value: "flat" },
        { label: "card", value: "card" },
      ],
    },
  },
  defaultProps: {
    items: [
      {
        title: "Feature",
        description: "Description",
        icon: "Feather",
      },
    ],
    mode: "flat",
  },
  render: ({ items, mode }) => {
    return (
      <Section className={getClassName({ cardMode: mode === "card" })}>
        <div className={getClassName("items")}>
          {items.map((item, i) => (
            <div key={i} className={getClassName("item")}>
              <div className={getClassName("icon")}>{icons[item.icon]}</div>
              <div className={getClassName("title")}>{item.title}</div>
              <div className={getClassName("description")}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </Section>
    );
  },
};
