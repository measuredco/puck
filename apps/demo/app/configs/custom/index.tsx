import { Config, Data } from "@measured/puck";
import { ButtonGroup, ButtonGroupProps } from "./blocks/ButtonGroup";
import { Hero, HeroProps } from "./blocks/Hero";
import { Heading, HeadingProps } from "./blocks/Heading";
import { FeatureList, FeatureListProps } from "./blocks/FeatureList";
import { Logos, LogosProps } from "./blocks/Logos";
import { Stats, StatsProps } from "./blocks/Stats";
import { Text, TextProps } from "./blocks/Text";
import { VerticalSpace, VerticalSpaceProps } from "./blocks/VerticalSpace";

import Root, { RootProps } from "./root";

type Props = {
  ButtonGroup: ButtonGroupProps;
  Hero: HeroProps;
  Heading: HeadingProps;
  FeatureList: FeatureListProps;
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
  components: {
    ButtonGroup,
    Hero,
    Heading,
    FeatureList,
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
            {
              label: "Edit this page",
              href: "/edit",
              variant: "secondary",
            },
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
        type: "FeatureList",
        props: {
          items: [
            {
              title: "Built for content teams",
              description:
                "Puck enables content teams to make changes to their content without a developer or breaking the UI.",
              icon: "PenTool",
            },
            {
              title: "Easy to integrate",
              description:
                "Front-end developers can easily integrate their own components using a familiar React API.",
              icon: "GitMerge",
            },
            {
              title: "No vendor lock-in",
              description:
                "Completely open-source, Puck is designed to be integrated into your existing React application.",
              icon: "GitHub",
            },
          ],
          id: "FeatureList-1687287577500",
          mode: "flat",
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
          text: "Plugins",
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
          text: "Puck can also be extended with plugins and headless CMS content adaptors, transforming Puck into the perfect tool for your Content Ops.",
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
        type: "FeatureList",
        props: {
          items: [
            {
              title: "plugin-heading-analyzer",
              description:
                "Analyze the document structure and identify WCAG 2.1 issues with your heading hierarchy.",
              icon: "AlignLeft",
            },
            {
              title: "Strapi.js Adaptor",
              description:
                "Connect your components with existing content from Strapi.js.",
              icon: "Feather",
            },
            {
              title: "Your custom plugin",
              description:
                "Create your own plugin to extend Puck for your use case using React.",
              icon: "Feather",
            },
            { title: "Title", description: "Description", icon: "Feather" },
            { title: "Title", description: "Description", icon: "Feather" },
            { title: "Title", description: "Description", icon: "Feather" },
          ],
          id: "FeatureList-1687296237386",
          mode: "card",
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
            {
              label: "Edit this page",
              href: "/edit",
              variant: "secondary",
            },
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
    root: { title: "Puck Example" },
  },
  "/pricing": {
    content: [],
    root: { title: "Pricing" },
  },
  "/about": {
    content: [],
    root: { title: "About Us" },
  },
};

export default conf;
