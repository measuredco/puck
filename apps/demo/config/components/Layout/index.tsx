import { CSSProperties, forwardRef, ReactNode } from "react";
import { ComponentConfig, DefaultComponentProps, ObjectField } from "@/core";
import { spacingOptions } from "../../options";
import { getClassNameFactory } from "@/core/lib";
import styles from "./styles.module.css";

const getClassName = getClassNameFactory("Layout", styles);

type LayoutFieldProps = {
  padding?: string;
  spanCol?: number;
  spanRow?: number;
  grow?: boolean;
};

export type WithLayout<Props extends DefaultComponentProps> = Props & {
  layout?: LayoutFieldProps;
};

type LayoutProps = WithLayout<{
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}>;

export const layoutField: ObjectField<LayoutFieldProps> = {
  type: "object",
  objectFields: {
    spanCol: {
      label: "Grid Columns",
      type: "number",
      min: 1,
      max: 12,
    },
    spanRow: {
      label: "Grid Rows",
      type: "number",
      min: 1,
      max: 12,
    },
    grow: {
      label: "Flex Grow",
      type: "radio",
      options: [
        { label: "true", value: true },
        { label: "false", value: false },
      ],
    },
    padding: {
      type: "select",
      label: "Vertical Padding",
      options: [{ label: "0px", value: "0px" }, ...spacingOptions],
    },
  },
};

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, layout, style }, ref) => {
    return (
      <div
        className={className}
        style={{
          gridColumn: layout?.spanCol
            ? `span ${Math.max(Math.min(layout.spanCol, 12), 1)}`
            : undefined,
          gridRow: layout?.spanRow
            ? `span ${Math.max(Math.min(layout.spanRow, 12), 1)}`
            : undefined,
          paddingTop: layout?.padding,
          paddingBottom: layout?.padding,
          flex: layout?.grow ? "1 1 0" : undefined,
          ...style,
        }}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

export function withLayout<
  Props extends DefaultComponentProps = DefaultComponentProps
>(
  componentConfig: ComponentConfig<Props>
): ComponentConfig<Props & { layout?: LayoutFieldProps }> {
  return {
    ...(componentConfig as any),
    fields: {
      ...componentConfig.fields,
      layout: layoutField,
    },
    defaultProps: {
      ...componentConfig.defaultProps,
      layout: {
        spanCol: 1,
        spanRow: 1,
        padding: "0px",
        grow: false,
        ...componentConfig.defaultProps?.layout,
      },
    },
    resolveFields: (_, params) => {
      if (params.parent?.type === "Grid") {
        return {
          ...componentConfig.fields,
          layout: {
            ...layoutField,
            objectFields: {
              spanCol: layoutField.objectFields.spanCol,
              spanRow: layoutField.objectFields.spanRow,
              padding: layoutField.objectFields.padding,
            },
          },
        };
      }
      if (params.parent?.type === "Flex") {
        return {
          ...componentConfig.fields,
          layout: {
            ...layoutField,
            objectFields: {
              grow: layoutField.objectFields.grow,
              padding: layoutField.objectFields.padding,
            },
          },
        };
      }

      return {
        ...componentConfig.fields,
        layout: {
          ...layoutField,
          objectFields: {
            padding: layoutField.objectFields.padding,
          },
        },
      };
    },
    inline: true,
    render: (props) => (
      <Layout
        className={getClassName()}
        layout={props.layout}
        ref={props.puck.dragRef}
      >
        {componentConfig.render(props)}
      </Layout>
    ),
  };
}
