import React from "react";
import { ComponentConfig } from "@/core/types";
import styles from "./styles.module.css";
import { getClassNameFactory } from "@/core/lib";
import { DropZone } from "@/core/components/DropZone";
import { Section } from "../../components/Section";
import { generateId } from "@/core/lib/generate-id";

const getClassName = getClassNameFactory("Columns", styles);

export type ColumnsProps = {
  distribution: "auto" | "manual";
  columns: {
    span?: number;
    id?: string;
  }[];
};

export const Columns: ComponentConfig<ColumnsProps> = {
  // Dynamically generate an ID for each column
  resolveData: ({ props }, { lastData }) => {
    if (lastData?.props.columns.length === props.columns.length) {
      return { props };
    }

    return {
      props: {
        ...props,
        columns: props.columns.map((column) => ({
          ...column,
          id: column.id ?? generateId(),
        })),
      },
    };
  },
  fields: {
    distribution: {
      type: "radio",
      options: [
        {
          value: "auto",
          label: "Auto",
        },
        {
          value: "manual",
          label: "Manual",
        },
      ],
    },
    columns: {
      type: "array",
      getItemSummary: (col) =>
        `Column (span ${
          col.span ? Math.max(Math.min(col.span, 12), 1) : "auto"
        })`,
      arrayFields: {
        span: {
          label: "Span (1-12)",
          type: "number",
          min: 0,
          max: 12,
        },
      },
    },
  },
  defaultProps: {
    distribution: "auto",
    columns: [{}, {}],
  },
  render: ({ columns, distribution }) => {
    return (
      <Section>
        <div
          className={getClassName()}
          style={{
            gridTemplateColumns:
              distribution === "manual"
                ? "repeat(12, 1fr)"
                : `repeat(${columns.length}, 1fr)`,
          }}
        >
          {columns.map(({ span, id }, idx) => (
            <div
              key={id ?? idx}
              style={{
                display: "flex",
                flexDirection: "column",
                gridColumn:
                  span && distribution === "manual"
                    ? `span ${Math.max(Math.min(span, 12), 1)}`
                    : "",
              }}
            >
              <DropZone
                zone={`column-${id ?? idx}`}
                disallow={["Hero", "Logos", "Stats"]}
              />
            </div>
          ))}
        </div>
      </Section>
    );
  },
};
