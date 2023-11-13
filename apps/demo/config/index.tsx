import { Config, Data } from "@/core/types/Config";
import { ButtonGroup, ButtonGroupProps } from "./blocks/ButtonGroup";
import { Card, CardProps } from "./blocks/Card";
import { Columns, ColumnsProps } from "./blocks/Columns";
import { Hero, HeroProps } from "./blocks/Hero";
import { Heading, HeadingProps } from "./blocks/Heading";
import { Flex, FlexProps } from "./blocks/Flex";
import { Logos, LogosProps } from "./blocks/Logos";
import { Stats, StatsProps } from "./blocks/Stats";
import { Text, TextProps } from "./blocks/Text";
import { VerticalSpace, VerticalSpaceProps } from "./blocks/VerticalSpace";

import Root, { RootProps } from "./root";

type Props = {
  ButtonGroup: ButtonGroupProps;
  Card: CardProps;
  Columns: ColumnsProps;
  Hero: HeroProps;
  Heading: HeadingProps;
  Flex: FlexProps;
  Logos: LogosProps;
  Stats: StatsProps;
  Text: TextProps;
  VerticalSpace: VerticalSpaceProps;
};

// We avoid the name config as next gets confused
export const conf: Config<Props, RootProps> = {
  root: {
    render: Root,
  },
  categories: {
    layout: {
      components: ["Columns", "Flex", "VerticalSpace"],
    },
    typography: {
      components: ["Heading", "Text"],
    },
    interactive: {
      title: "Actions",
      components: ["ButtonGroup"],
    },
  },
  components: {
    ButtonGroup,
    Card,
    Columns,
    Hero,
    Heading,
    Flex,
    Logos,
    Stats,
    Text,
    VerticalSpace,
  },
};

export const initialData: Record<string, Data> = {
  "/": {
    content: [
      {
        type: "Hero",
        props: {
          title: "This page was built with Puck",
          description:
            "Puck is the self-hosted visual editor for React. Bring your own components and make site changes instantly, without a deploy.",
          buttons: [
            {
              label: "Visit GitHub",
              href: "https://github.com/measuredco/puck",
            },
            { label: "Edit this page", href: "/edit", variant: "secondary" },
          ],
          id: "Hero-1687283596554",
          height: "",
          imageUrl:
            "https://images.unsplash.com/photo-1687204209659-3bded6aecd79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
          imageMode: "inline",
          padding: "128px",
          align: "left",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "96px", id: "VerticalSpace-1687298109536" },
      },
      {
        type: "Heading",
        props: {
          align: "center",
          level: "2",
          text: "Drag-and-drop your own React components",
          padding: "0px",
          size: "xxl",
          id: "Heading-1687297593514",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "8px", id: "VerticalSpace-1687284122744" },
      },
      {
        type: "Text",
        props: {
          align: "center",
          text: "Configure Puck with your own components to make change for your marketing pages without a developer.",
          padding: "0px",
          size: "m",
          id: "Text-1687297621556",
          color: "muted",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "40px", id: "VerticalSpace-1687296179388" },
      },
      {
        type: "Columns",
        props: {
          columns: [{}, {}, {}],
          distribution: "auto",
          id: "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "96px", id: "VerticalSpace-1687287070296" },
      },
      {
        type: "VerticalSpace",
        props: { size: "96px", id: "VerticalSpace-1687298110602" },
      },
      {
        type: "Heading",
        props: {
          align: "center",
          level: 2,
          text: "The numbers",
          padding: "0px",
          size: "xxl",
          id: "Heading-1687296574110",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "16px", id: "VerticalSpace-1687284283005" },
      },
      {
        type: "Text",
        props: {
          align: "center",
          text: 'This page demonstrates Puck configured with a custom component library. This component is called "Stats", and contains some made-up numbers. You can configure any page by adding "/edit" onto the URL.',
          padding: "0px",
          size: "m",
          id: "Text-1687284565722",
          color: "muted",
          maxWidth: "916px",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "96px", id: "VerticalSpace-1687297618253" },
      },
      {
        type: "Stats",
        props: {
          items: [
            { title: "Users reached", description: "20M+", icon: "Feather" },
            { title: "Cost savings", description: "$1.5M", icon: "Feather" },
            { title: "Another stat", description: "5M kg", icon: "Feather" },
            { title: "Final fake stat", description: "15K", icon: "Feather" },
          ],
          mode: "flat",
          id: "Stats-1687297239724",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "120px", id: "VerticalSpace-1687297589663" },
      },
      {
        type: "Heading",
        props: {
          align: "center",
          level: 2,
          text: "Extending Puck",
          padding: "0px",
          size: "xxl",
          id: "Heading-1687296184321",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "8px", id: "VerticalSpace-1687296602860" },
      },
      {
        type: "Text",
        props: {
          align: "center",
          text: "Puck can also be extended with plugins and headless CMS content fields, transforming Puck into the perfect tool for your Content Ops.",
          padding: "0px",
          size: "m",
          id: "Text-1687296579834",
          color: "muted",
          maxWidth: "916px",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "96px", id: "VerticalSpace-1687299311382" },
      },
      {
        type: "Columns",
        props: {
          columns: [
            { span: 4 },
            { span: 4 },
            { span: 4 },
            { span: 4 },
            { span: 4 },
            { span: 4 },
          ],
          id: "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634",
          distribution: "manual",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "96px", id: "VerticalSpace-1687299315421" },
      },
      {
        type: "Heading",
        props: {
          align: "center",
          level: 2,
          text: "Get started",
          padding: "0px",
          size: "xxl",
          id: "Heading-1687299303766",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "16px", id: "VerticalSpace-1687299318902" },
      },
      {
        type: "Text",
        props: {
          align: "center",
          text: "Browse the Puck GitHub to get started, or try editing this page",
          padding: "0px",
          size: "m",
          id: "Text-1687299305686",
          color: "muted",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "24px", id: "VerticalSpace-1687299335149" },
      },
      {
        type: "ButtonGroup",
        props: {
          buttons: [
            {
              label: "Visit GitHub",
              href: "https://github.com/measuredco/puck",
            },
            { label: "Edit this page", href: "/edit", variant: "secondary" },
          ],
          id: "ButtonGroup-1687299235545",
          align: "center",
        },
      },
      {
        type: "VerticalSpace",
        props: { size: "96px", id: "VerticalSpace-1687284290127" },
      },
    ],
    root: { props: { title: "Puck Example" } },
    zones: {
      "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06:column-0": [
        {
          type: "Card",
          props: {
            title: "Built for content teams",
            description:
              "Puck enables content teams to make changes to their content without a developer or breaking the UI.",
            icon: "PenTool",
            mode: "flat",
            id: "Card-0d9077e00e0ad66c34c62ab6986967e1ce04f9e4",
          },
        },
      ],
      "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06:column-1": [
        {
          type: "Card",
          props: {
            title: "Easy to integrate",
            description:
              "Front-end developers can easily integrate their own components using a familiar React API.",
            icon: "GitMerge",
            mode: "flat",
            id: "Card-978bef5d136d4b0d9855f5272429986ceb22e5a6",
          },
        },
      ],
      "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06:column-2": [
        {
          type: "Card",
          props: {
            title: "No vendor lock-in",
            description:
              "Completely open-source, Puck is designed to be integrated into your existing React application.",
            icon: "GitHub",
            mode: "flat",
            id: "Card-133a61826f0019841aec6f0aec011bf07e6bc6de",
          },
        },
      ],
      "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-0": [
        {
          type: "Card",
          props: {
            title: "plugin-heading-analyzer",
            description:
              "Analyze the document structure and identify WCAG 2.1 issues with your heading hierarchy.",
            icon: "AlignLeft",
            mode: "card",
            id: "Card-e2e757b0b4a579d5f87564dfa9b4442f9794b45b",
          },
        },
      ],
      "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-1": [
        {
          type: "Card",
          props: {
            title: "External data",
            description:
              "Connect your components with an existing data source, like Strapi.js.",
            icon: "Feather",
            mode: "card",
            id: "Card-4eea28543d13c41c30934c3e4c4c95a75017a89c",
          },
        },
      ],
      "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-2": [
        {
          type: "Card",
          props: {
            title: "Custom plugins",
            description:
              "Create your own plugin to extend Puck for your use case using React.",
            icon: "Feather",
            mode: "card",
            id: "Card-3314e8b24aa52843ce22ab7424b8f3b8064acfdf",
          },
        },
      ],
      "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-3": [
        {
          type: "Card",
          props: {
            title: "Title",
            description: "Description",
            icon: "Feather",
            mode: "card",
            id: "Card-49b11940784cfe8dc1a2b2facc5ac2bcf797792f",
          },
        },
      ],
      "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-4": [
        {
          type: "Card",
          props: {
            title: "Title",
            description: "Description",
            icon: "Feather",
            mode: "card",
            id: "Card-efb0a1ed06cc4152a7861376aafbe62b0445382d",
          },
        },
      ],
      "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-5": [
        {
          type: "Card",
          props: {
            title: "Title",
            description: "Description",
            icon: "Feather",
            mode: "card",
            id: "Card-513cfb17d07ba4b6e0212d931571c0760839f029",
          },
        },
      ],
    },
  },
  "/pricing": {
    content: [],
    root: { props: { title: "Pricing" } },
  },
  "/about": {
    content: [],
    root: { props: { title: "About Us" } },
  },
};

export default conf;
