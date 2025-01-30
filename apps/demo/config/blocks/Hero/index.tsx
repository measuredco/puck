/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { ComponentConfig } from "@/core/types";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { Button } from "@/core/components/Button";
import { Section } from "../../components/Section";
import { quotes } from "./quotes";
import { AutoField, FieldLabel } from "@/core";
import { Link2 } from "lucide-react";

const getClassName = getClassNameFactory("Hero", styles);

export type HeroProps = {
  quote?: { index: number; label: string };
  title: string;
  description: string;
  align?: string;
  padding: string;
  image?: {
    mode?: "inline" | "background";
    url?: string;
  };
  buttons: {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }[];
};

export const Hero: ComponentConfig<HeroProps> = {
  fields: {
    quote: {
      type: "external",
      placeholder: "Select a quote",
      showSearch: false,
      renderFooter: ({ items }) => {
        return (
          <div>
            {items.length} result{items.length === 1 ? "" : "s"}
          </div>
        );
      },
      filterFields: {
        author: {
          type: "select",
          options: [
            { value: "", label: "Select an author" },
            { value: "Mark Twain", label: "Mark Twain" },
            { value: "Henry Ford", label: "Henry Ford" },
            { value: "Kurt Vonnegut", label: "Kurt Vonnegut" },
            { value: "Andrew Carnegie", label: "Andrew Carnegie" },
            { value: "C. S. Lewis", label: "C. S. Lewis" },
            { value: "Confucius", label: "Confucius" },
            { value: "Eleanor Roosevelt", label: "Eleanor Roosevelt" },
            { value: "Samuel Ullman", label: "Samuel Ullman" },
          ],
        },
      },
      fetchList: async ({ query, filters }) => {
        // Simulate delay
        await new Promise((res) => setTimeout(res, 500));

        return quotes
          .map((quote, idx) => ({
            index: idx,
            title: quote.author,
            description: quote.content,
          }))
          .filter((item) => {
            if (filters?.author && item.title !== filters?.author) {
              return false;
            }

            if (!query) return true;

            const queryLowercase = query.toLowerCase();

            if (item.title.toLowerCase().indexOf(queryLowercase) > -1) {
              return true;
            }

            if (item.description.toLowerCase().indexOf(queryLowercase) > -1) {
              return true;
            }
          });
      },
      mapRow: (item) => ({
        title: item.title,
        description: <span>{item.description}</span>,
      }),
      mapProp: (result) => {
        return { index: result.index, label: result.description };
      },
      getItemSummary: (item) => item.label,
    },
    title: { type: "text" },
    description: { type: "textarea" },
    buttons: {
      type: "array",
      min: 1,
      max: 4,
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
      defaultItemProps: {
        label: "Button",
        href: "#",
      },
    },
    align: {
      type: "radio",
      options: [
        { label: "left", value: "left" },
        { label: "center", value: "center" },
      ],
    },
    image: {
      type: "object",
      objectFields: {
        url: {
          type: "custom",
          render: ({ value, field, name, onChange, readOnly }) => (
            <FieldLabel
              label={field.label || name}
              readOnly={readOnly}
              icon={<Link2 size="16" />}
            >
              <AutoField
                field={{ type: "text" }}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
              />
            </FieldLabel>
          ),
        },
        mode: {
          type: "radio",
          options: [
            { label: "inline", value: "inline" },
            { label: "background", value: "background" },
          ],
        },
      },
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
  resolveFields: async (data, { fields }) => {
    if (data.props.align === "center") {
      return {
        ...fields,
        image: undefined,
      };
    }

    return fields;
  },
  resolvePermissions: async (data, params) => {
    if (!params.changed.quote) return params.lastPermissions;

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      ...params.permissions,
      // Disable delete if quote 7 is selected
      delete: data.props.quote?.index !== 7,
    };
  },
  render: ({ align, title, description, buttons, padding, image, puck }) => {
    // Empty state allows us to test that components support hooks
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [_] = useState(0);

    return (
      <Section
        className={getClassName({
          left: align === "left",
          center: align === "center",
          hasImageBackground: image?.mode === "background",
        })}
        style={{ paddingTop: padding, paddingBottom: padding }}
      >
        {image?.mode === "background" && (
          <>
            <div
              className={getClassName("image")}
              style={{
                backgroundImage: `url("${image?.url}")`,
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
                  tabIndex={puck.isEditing ? -1 : undefined}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>

          {align !== "center" && image?.mode !== "background" && image?.url && (
            <div
              style={{
                backgroundImage: `url('${image?.url}')`,
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
