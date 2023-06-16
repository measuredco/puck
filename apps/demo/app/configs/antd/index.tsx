import { Config, Data } from "core/types/Config";
import { CardDeck, CardDeckProps } from "./blocks/CardDeck";
import { Carousel, CarouselProps } from "./blocks/Carousel";
import { Hero, HeroProps } from "./blocks/Hero";
import { Video, VideoProps } from "./blocks/Video";
import { Page, PageProps } from "./page";

type Props = {
  CardDeck: CardDeckProps;
  Carousel: CarouselProps;
  Hero: HeroProps;
  Video: VideoProps;
};

// We avoid the name config as next gets confused
export const conf: Config<Props, PageProps> = {
  page: {
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
    render: Page,
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
        type: "Video",
        props: {
          id: "Video-1686934345327",
          src: "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*uYT7SZwhJnUAAAAAAAAAAAAADgCCAQ",
        },
      },
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
      { type: "CardDeck", props: { id: "CardDeck-1686933786390" } },
      {
        type: "Carousel",
        props: {
          id: "Carousel-1686926848790",
          slides: [
            {
              imageUrl:
                "https://images.unsplash.com/photo-1686903430777-279ba0f25e7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2750&q=80",
              alt: "The sun is setting",
            },
            {
              imageUrl:
                "https://images.unsplash.com/photo-1682685797365-41f45b562c0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
              alt: "desert sunset",
            },
          ],
        },
      },
    ],
    page: { title: "Home", layout: "" },
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
    page: { title: "About us", layout: "" },
  },
};

export default conf;
