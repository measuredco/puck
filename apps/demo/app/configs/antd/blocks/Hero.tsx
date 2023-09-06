import React from "react";
import { Button, Image, Space, Typography } from "antd";
import { ComponentConfig } from "@measured/puck";

export type HeroProps = {
  title: string;
  description: string;
  ctas: {
    label: string;
    href: string;
    type?: "primary" | "text";
  }[];
};

const contentStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  margin: 0,
  height: "400px",
  color: "#fff",
  background: "#364d79",
};

export const Hero: ComponentConfig<HeroProps> = {
  fields: {
    title: {
      type: "text",
    },
    description: {
      type: "textarea",
    },
    ctas: {
      type: "array",
      arrayFields: {
        label: {
          type: "text",
        },
        href: {
          type: "text",
        },
        type: {
          type: "radio",
          options: [
            {
              value: "primary",
              label: "Primary",
            },
            {
              value: "text",
              label: "Text",
            },
          ],
        },
      },
    },
  },
  defaultProps: {
    title: "Title",
    description: "Description",
    ctas: [{ label: "Click me", href: "#", type: "primary" }],
  },
  render: ({ title, description, ctas }) => {
    return (
      <div style={{ background: "white" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: 48,
          }}
        >
          <Typography.Title>
            <b>{title}</b>
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: 32 }}>
            {description}
          </Typography.Paragraph>

          <Space align="center">
            {ctas.map((cta, i) => (
              <Button key={i} href={cta.href} type={cta.type}>
                {cta.label}
              </Button>
            ))}
          </Space>
        </div>
      </div>
    );
  },
};
