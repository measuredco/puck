import { Config, Data } from "@measured/puck";
import { CardDeck, CardDeckProps } from "./blocks/CardDeck";
import { Carousel, CarouselProps } from "./blocks/Carousel";
import { Hero, HeroProps } from "./blocks/Hero";
import { Video, VideoProps } from "./blocks/Video";
import { Root, RootProps } from "./root";

type Props = {
  CardDeck: CardDeckProps;
  Carousel: CarouselProps;
  Hero: HeroProps;
  Video: VideoProps;
};

// We avoid the name config as next gets confused
export const conf: Config<Props, RootProps> = {
  root: {
    fields: {
      title: {
        type: "text",
      },
      layout: {
        type: "select",
        options: [
          {
            value: "",
            label: "Default",
          },
          {
            value: "sidebar",
            label: "Sidebar",
          },
        ],
      },
    },
    render: Root,
  },
  components: {
    CardDeck,
    Carousel,
    Hero,
    Video,
  },
};

export const initialData: Record<string, Data> = {
  "/": {
    content: [
      {
        type: "Hero",
        props: {
          id: "Hero-1686932817569",
          ctas: [
            { label: "Click me", href: "#", type: "primary" },
            { label: "Click me", href: "#" },
          ],
          title: "Hello, world",
          description: "This is an example page built with puck and antd.",
        },
      },
    ],
    root: { title: "Home", layout: "" },
  },
  "/about": {
    content: [
      {
        type: "Hero",
        props: {
          id: "Hero-1686937288591",
          title: "About page",
          description: "Here you can find information about us",
        },
      },
    ],
    root: { title: "About us", layout: "" },
  },
};

export default conf;
