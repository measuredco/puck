import React from "react";

import Grid from "@mui/material/Grid";

import { ComponentConfig } from "core/types/Config";

export type CardDeckProps = {};

const contentStyle: React.CSSProperties = {
  margin: 0,
  height: "160px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};

export const CardDeck: ComponentConfig<CardDeckProps> = {
  fields: {},
  render: () => {
    return (
      <Grid container spacing={2}>
        <Grid xs={8}>item</Grid>
        <Grid xs={4}>item</Grid>
        <Grid xs={4}>item</Grid>
        <Grid xs={8}>item</Grid>
      </Grid>
    );
  },
};
