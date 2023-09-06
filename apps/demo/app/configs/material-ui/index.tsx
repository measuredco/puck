import { Config, Data } from "@measured/puck";
import { ButtonGroup, ButtonGroupProps } from "./blocks/ButtonGroup";
import { CardDeck, CardDeckProps } from "./blocks/CardDeck";
import {
  TypographyBlock,
  TypographyBlockProps,
} from "./blocks/TypographyBlock";
import { ImageList, ImageListProps } from "./blocks/ImageList";
import { VerticalSpace, VerticalSpaceProps } from "./blocks/VerticalSpace";
import Root, { RootProps } from "./root";

type Props = {
  ButtonGroup: ButtonGroupProps;
  CardDeck: CardDeckProps;
  TypographyBlock: TypographyBlockProps;
  ImageList: ImageListProps;
  VerticalSpace: VerticalSpaceProps;
};

// We avoid the name config as next gets confused
export const conf: Config<Props, RootProps> = {
  root: {
    fields: {
      title: {
        type: "text",
      },
      primaryColor: {
        type: "text",
      },
      primaryContrastTextColor: {
        type: "text",
      },
    },
    render: Root,
  },
  components: {
    ButtonGroup,
    CardDeck,
    ImageList,
    TypographyBlock,
    VerticalSpace,
  },
};

export const initialData: Record<string, Data> = {
  "/": {
    content: [
      {
        type: "TypographyBlock",
        props: {
          id: "TypographyBlock-1687176683114",
          variant: "h1",
          component: "h1",
          text: "Built with MUI + Puck",
          paddingBottom: "1",
          paddingTop: "20",
          align: "center",
          maxWidth: "lg",
        },
      },
      {
        type: "TypographyBlock",
        props: {
          id: "TypographyBlock-1687177981461",
          variant: "h5",
          component: "p",
          text: "This example page implements the Material UI component library using the Puck block editor for React.",
          paddingBottom: "3",
          paddingTop: "0",
          align: "center",
          maxWidth: "lg",
        },
      },
      {
        type: "ButtonGroup",
        props: {
          buttons: [
            {
              variant: "contained",
              label: "Learn more",
              href: "https://github.com/measuredco/puck",
            },
          ],
          paddingBottom: "15",
          paddingTop: "0",
          maxWidth: "lg",
          id: "ButtonGroup-1687199169239",
          align: "center",
        },
      },
      {
        type: "CardDeck",
        props: {
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
          id: "CardDeck-1687200029855",
        },
      },
      {
        type: "TypographyBlock",
        props: {
          id: "TypographyBlock-1687196807389",
          variant: "h4",
          component: "h2",
          text: "Share your #muiexperience",
          paddingBottom: "1",
          paddingTop: "8",
          align: "center",
        },
      },
      {
        type: "ImageList",
        props: {
          id: "ImageList-1687193148175",
          maxWidth: "lg",
          paddingBottom: "6",
          paddingTop: "3",
          variant: "standard",
        },
      },
    ],
    root: { title: "MUI Demo" },
  },
};

export default conf;
