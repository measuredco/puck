import React from "react";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2

import { ComponentConfig } from "@measured/puck";
import { Container, ContainerProps, containerFields } from "../Container";

export type CardDeckProps = {
  cards: {
    title: string;
    subtitle: string;
    eyebrow: string;
    content: string;
    cta: string;
  }[];
} & ContainerProps;

export default function BasicCard({ eyebrow, title, subtitle, content, cta }) {
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {eyebrow}
        </Typography>
        <Typography
          sx={{ fontSize: 14 }}
          color="text.secondary"
          gutterBottom
        ></Typography>
        <Typography variant="h5" component="div">
          {title}
        </Typography>

        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {subtitle}
        </Typography>

        <Typography variant="body2">{content}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small">{cta}</Button>
      </CardActions>
    </Card>
  );
}

const definedElse = (str: string, fallback: string) =>
  typeof str !== "undefined" ? str : fallback;

export const CardDeck: ComponentConfig<CardDeckProps> = {
  fields: {
    cards: {
      type: "array",
      arrayFields: {
        title: { type: "text" },
        subtitle: { type: "text" },
        content: { type: "textarea" },
        eyebrow: { type: "text" },
        cta: { type: "text" },
      },
      getItemSummary: (item, idx) => item.title || `Card #${idx}`,
    },
    ...containerFields,
  },
  defaultProps: {
    cards: [
      {
        title: "Title",
        content: "Content",
        subtitle: "Subtitle",
        eyebrow: "Eyebrow",
        cta: "Click me",
      },
      {
        title: "Title",
        content: "Content",
        subtitle: "Subtitle",
        eyebrow: "Eyebrow",
        cta: "Click me",
      },
      {
        title: "Title",
        content: "Content",
        subtitle: "Subtitle",
        eyebrow: "Eyebrow",
        cta: "Click me",
      },
    ],
  },
  render: ({ cards, ...props }) => {
    return (
      <Container {...props}>
        <Grid container spacing={5} margin={0}>
          {cards.map((card, i) => (
            <Grid xs={4} key={i}>
              <BasicCard
                eyebrow={definedElse(card.eyebrow, "Eyebrow")}
                title={definedElse(card.title, "Title")}
                subtitle={definedElse(card.subtitle, "Subtitle")}
                content={definedElse(card.content, "Content")}
                cta={definedElse(card.cta, "Click me")}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  },
};
