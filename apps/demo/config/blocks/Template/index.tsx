import React from "react";
import { ComponentConfig, ComponentData, Content } from "@/core/types";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { Section } from "../../components/Section";
import { withLayout } from "../../components/Layout";
import { generateId } from "@/core/lib/generate-id";
import { type Props } from "../../index";

async function createComponent<T extends keyof Props>(
  component: T,
  props?: Partial<Props[T]>
) {
  // const test = dynamic(() => import("../../index"));
  const { conf: config } = await import("../../index");

  // "a-arrow-down": () => import('./dist/esm/icons/a-arrow-down.js'),

  return {
    type: component,
    props: {
      ...config.components[component].defaultProps,
      ...props,
      id: generateId(component),
    },
  };
}

const getClassName = getClassNameFactory("Template", styles);

type Slot = ComponentData[];

export type TemplateProps = {
  template: string;
  children: Content;
};

export const TemplateInternal: ComponentConfig<TemplateProps> = {
  fields: {
    template: {
      type: "select",
      options: [
        { label: "Template 1", value: "template_1" },
        { label: "Template 2", value: "template_2" },
      ],
    },
    children: {
      type: "slot",
    },
  },
  defaultProps: {
    template: "template_1",
    children: [],
  },
  resolveData: async (data, { changed }) => {
    if (!changed.template) return data;

    const templates: Record<string, Content> = {
      template_1: [
        await createComponent("Grid", {
          numColumns: 2,
          children: [
            await createComponent("Card", { title: "A card", mode: "card" }),
            await createComponent("Flex", {
              direction: "column",
              gap: 0,
              children: [
                await createComponent("Space", {
                  size: "32px",
                }),
                await createComponent("Heading", {
                  text: "Template example",
                  size: "xl",
                }),
                await createComponent("Text", {
                  text: "Dynamically create components using the new slots API.",
                }),
                await createComponent("Space", {
                  size: "16px",
                }),
                await createComponent("Button", {
                  variant: "secondary",
                  label: "Learn more",
                }),
                await createComponent("Space", {
                  size: "32px",
                }),
              ],
            }),
          ],
        }),
      ],
      template_2: [
        await createComponent("Grid", {
          numColumns: 3,
          children: [
            await createComponent("Space", {
              size: "32px",
            }),
            await createComponent("Flex", {
              direction: "column",
              gap: 0,
              justifyContent: "center",
              children: [
                await createComponent("Space", {
                  size: "32px",
                }),
                await createComponent("Heading", {
                  text: "Template example",
                  size: "xl",
                }),
                await createComponent("Text", {
                  text: "Dynamically create components using the new slots API.",
                }),
                await createComponent("Space", {
                  size: "16px",
                }),
                await createComponent("Button", {
                  variant: "secondary",
                  label: "Learn more",
                }),
                await createComponent("Space", {
                  size: "32px",
                }),
              ],
            }),
            await createComponent("Space", {
              size: "32px",
            }),
          ],
        }),
      ],
    };

    const children = templates[data.props.template];

    return {
      ...data,
      props: {
        ...data.props,
        children,
      },
    };
  },
  // TODO the `children` field is now broken. Fix it. Using DropZone instead.
  render: ({ children, children: Children }) => {
    return (
      <Section>
        {/* <Slot
          initialData={[createHeading("Slot")]}
        /> */}

        {/* <DropZone
          zone="children"
          disallow={["Hero", "Stats"]}
          className={getClassName()}
          style={{
            gap,
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
          }}
        /> */}
        {children({
          className: getClassName(),
        })}
        {/* <Children
          disallow={["Hero", "Stats"]}
          className={getClassName()}
          style={{
            gap,
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
          }}
        /> */}
      </Section>
    );
  },
};

export const Template = withLayout(TemplateInternal);
