import React from "react";
import { ComponentConfig, Content } from "@/core/types";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { DropZone } from "@/core/components/DropZone";
import { Slot } from "@/core/components/Slot";
import { Section } from "../../components/Section";
import { WithLayout, withLayout } from "../../components/Layout";
import { Props } from "../..";

const getClassName = getClassNameFactory("Flex", styles);

export type FlexProps = WithLayout<{
  justifyContent: "start" | "center" | "end";
  direction: "row" | "column";
  gap: number;
  wrap: "wrap" | "nowrap";
  children: Content<Props>;
}>;

const FlexInternal: ComponentConfig<FlexProps> = {
  fields: {
    direction: {
      label: "Direction",
      type: "radio",
      options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
      ],
    },
    justifyContent: {
      label: "Justify Content",
      type: "radio",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
      ],
    },
    gap: {
      label: "Gap",
      type: "number",
      min: 0,
    },
    wrap: {
      label: "Wrap",
      type: "radio",
      options: [
        { label: "true", value: "wrap" },
        { label: "false", value: "nowrap" },
      ],
    },
    children: {
      type: "slot",
    },
  },
  defaultProps: {
    justifyContent: "start",
    direction: "row",
    gap: 24,
    wrap: "wrap",
    layout: {
      grow: true,
    },
    children: [],
  },
  render: ({ justifyContent, direction, gap, wrap, children, id }) => {
    return (
      <Section style={{ height: "100%" }}>
        {children}
        {/* <Slot content={children} name="children" areaId={id} /> */}

        {/* <DropZone
          className={getClassName()}
          style={{
            justifyContent,
            flexDirection: direction,
            gap,
            flexWrap: wrap,
          }}
          zone="flex"
          disallow={["Hero", "Stats"]}
        /> */}
        {/* <DropZone
          className={getClassName()}
          style={{
            justifyContent,
            flexDirection: direction,
            gap,
            flexWrap: wrap,
          }}
          zone="flex"
          disallow={["Hero", "Stats"]}
        /> */}
      </Section>
    );
  },
};

export const Flex = withLayout(FlexInternal);
