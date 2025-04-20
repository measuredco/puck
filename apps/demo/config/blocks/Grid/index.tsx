import React from "react";
import { ComponentConfig, Content } from "@/core/types";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { Section } from "../../components/Section";
import { withLayout } from "../../components/Layout";

const getClassName = getClassNameFactory("Grid", styles);

export type GridProps = {
  numColumns: number;
  gap: number;
  children: Content;
};

export const GridInternal: ComponentConfig<GridProps> = {
  fields: {
    numColumns: {
      type: "number",
      label: "Number of columns",
      min: 1,
      max: 12,
    },
    gap: {
      label: "Gap",
      type: "number",
      min: 0,
    },
    children: {
      type: "slot",
    },
  },
  defaultProps: {
    numColumns: 4,
    gap: 24,
    children: [],
  },
  render: ({ gap, numColumns, children: Children }) => {
    return (
      <Section>
        <Children
          disallow={["Hero", "Stats"]}
          className={getClassName()}
          style={{
            gap,
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
          }}
        />
      </Section>
    );
  },
};

export const Grid = withLayout(GridInternal);
