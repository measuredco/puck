import { Config } from "../types/Config";
import strapiAdaptor from "./adaptors/strapi";

type Props = {
  Hero: {
    heading: string;
  };
  FeatureList: {
    _data: object; // strapi data
    title: string;
    description: string;
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
      },
    },
  ],

  fields: {
    Hero: {
      heading: { type: "text" },
    },
    FeatureList: {
      _data: {
        type: "external",
        adaptor: strapiAdaptor,
        adaptorParams: {
          resource: "movies",
        },
      },
      title: {
        type: "text",
      },
      description: {
        type: "text",
      },
    },
  },

  mapping: {
    Hero: ({ heading }) => (
      <div style={{ background: "black", color: "white", padding: 128 }}>
        <h1>{heading}</h1>
      </div>
    ),
    FeatureList: ({ title, description, ..._data }) => (
      <div style={{ background: "white", color: "black", padding: 128 }}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    ),
  },
};

export default config;
