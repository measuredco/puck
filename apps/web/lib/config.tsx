import { Config } from "../types/Config";

type Props = {
  Hero: {
    heading: string;
  };
  FeatureList: {
    heading: string;
    item1: string;
    item2: string;
    item3: string;
  };
};

export const config: Config<Props> = {
  initialData: [
    {
      type: "Hero",
      props: {
        id: "hero",
        heading: "Heading",
      },
    },
    {
      type: "FeatureList",
      props: {
        id: "fl1",
        heading: "Features",
        item1: "Great feature",
        item2: "Great feature",
        item3: "Great feature",
      },
    },
  ],

  fields: {
    Hero: {
      heading: { type: "text" },
    },
    FeatureList: {
      heading: { type: "text" },
      item1: { type: "text" },
      item2: { type: "text" },
      item3: { type: "text" },
    },
  },

  mapping: {
    Hero: ({ heading }) => (
      <div style={{ background: "black", color: "white", padding: 128 }}>
        <h1>{heading}</h1>
      </div>
    ),
    FeatureList: ({ heading, item1, item2, item3 }) => (
      <div style={{ background: "white", color: "black", padding: 128 }}>
        <h2>{heading}</h2>
        <ul>
          <li>{item1}</li>
          <li>{item2}</li>
          <li>{item3}</li>
        </ul>
      </div>
    ),
  },
};

export default config;
