import { Config, Data } from "core/types/Config";
import { strapiAdaptor } from "adaptors";

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
  Hero: {
    render: ({ heading = "Heading" }) => (
      <div style={{ background: "black", color: "white", padding: 128 }}>
        <h1>{heading}</h1>
      </div>
    ),
    fields: {
      heading: { type: "text" },
    },
  },
  FeatureList: {
    render: ({ title = "Title", description = "Description" }) => (
      <div style={{ background: "white", color: "black", padding: 128 }}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    ),
    fields: {
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
};

export const initialData: Data<Props> = [
  {
    type: "Hero",
    props: {
      id: "hero",
    },
  },
  {
    type: "FeatureList",
    props: {
      id: "fl1",
    },
  },
];

export default config;
