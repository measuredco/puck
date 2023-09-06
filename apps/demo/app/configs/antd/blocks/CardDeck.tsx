import React from "react";
import { Card, Col, Row } from "antd";
import { ComponentConfig } from "@measured/puck";

export type CardDeckProps = {
  cards: { title: string; content: string }[];
};

export const CardDeck: ComponentConfig<CardDeckProps> = {
  fields: {
    cards: {
      type: "array",
      arrayFields: { title: { type: "text" }, content: { type: "textarea" } },
    },
  },
  defaultProps: {
    cards: [
      { title: "Title", content: "Content" },
      { title: "Title", content: "Content" },
      { title: "Title", content: "Content" },
    ],
  },
  render: ({ cards }) => {
    return (
      <div
        style={{
          background: "white",
          padding: 48,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 1024, width: "100%" }}>
          <Row gutter={16}>
            {cards.map((item, i) => (
              <Col
                className="gutter-row"
                span={8}
                key={i}
                style={{ marginBottom: 16 }}
              >
                <Card title={item.title} style={{ width: "300" }}>
                  {item.content}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  },
};
