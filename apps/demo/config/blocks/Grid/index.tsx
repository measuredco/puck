import React from "react";
import { ComponentConfig } from "@/core/types";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { DropZone } from "@/core/components/DropZone";
import { Section } from "../../components/Section";
import { withLayout } from "../../components/Layout";

const getClassName = getClassNameFactory("Grid", styles);

export type GridProps = {
  numColumns: number;
  gap: number;
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
  },
  defaultProps: {
    numColumns: 4,
    gap: 24,
  },
  render: ({ gap, numColumns }) => {
    return (
      <Section>
        <DropZone
          zone="grid"
          disallow={["Hero", "Stats"]}
          className={getClassName()}
          style={{
            gap,
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
          }}
        ></DropZone>
      </Section>
    );
  },
};

export const Grid = withLayout(GridInternal);
