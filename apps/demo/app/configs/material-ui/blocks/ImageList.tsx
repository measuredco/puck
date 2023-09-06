import React from "react";

import {
  ImageList as _ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import { Container, ContainerProps, containerFields } from "../Container";

import { ComponentConfig } from "@measured/puck";

export type ImageListProps = {
  variant: "masonry" | "quilted" | "standard" | "woven";
} & ContainerProps;

const itemData = [
  {
    img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
    title: "Breakfast",
    author: "@bkristastucchio",
  },
  {
    img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
    title: "Burger",
    author: "@rollelflex_graphy726",
  },
  {
    img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
    title: "Camera",
    author: "@helloimnik",
  },
  {
    img: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
    title: "Coffee",
    author: "@nolanissac",
  },
  {
    img: "https://images.unsplash.com/photo-1533827432537-70133748f5c8",
    title: "Hats",
    author: "@hjrc33",
  },
  {
    img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
    title: "Honey",
    author: "@arwinneil",
  },
  {
    img: "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6",
    title: "Basketball",
    author: "@tjdragotta",
  },
  {
    img: "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f",
    title: "Fern",
    author: "@katie_wasserman",
  },
  {
    img: "https://images.unsplash.com/photo-1597645587822-e99fa5d45d25",
    title: "Mushrooms",
    author: "@silverdalex",
  },
];

export const ImageList: ComponentConfig<ImageListProps> = {
  fields: {
    variant: {
      type: "select",
      options: [
        { value: "standard", label: "standard" },
        { value: "masonary", label: "masonary" },
        { value: "quilted", label: "quilted" },
        { value: "woven", label: "woven" },
      ],
    },
    ...containerFields,
  },
  render: ({ variant, ...props }) => {
    return (
      <Container {...props}>
        <_ImageList cols={3} sx={{ margin: 0 }} variant={variant}>
          {itemData.map((item) => (
            <ImageListItem key={item.img}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${item.img}?w=248&fit=crop&auto=format`}
                srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                alt={item.title}
                loading="lazy"
              />
              <ImageListItemBar
                title={item.title}
                subtitle={<span>by: {item.author}</span>}
              />
            </ImageListItem>
          ))}
        </_ImageList>
      </Container>
    );
  },
};
