import { Config, Data } from "core/types/Config";
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
  page: {
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
    content: [],
    page: { title: "Custom Example" },
  },
};

export default conf;
