import { Config } from "core/types/Config";

import {
  Base,
  Cards,
  Contact,
  Footer,
  Header,
  Hero,
  Logos,
  Section,
  Space,
  Technologies,
  Work,
} from "./components";

type Props = {
  Contact: {};
  Clients: {};
  Footer: {};
  Header: {};
  Hero: {
    strapline: string;
    description: string;
  };
  Services: {};
  Space: {};
  Technologies: {};
  Work: { client: string; image: string; project: string; url: string };
};

export const config: Config<Props> = {
  page: {
    render: Base,
  },
  components: {
    Contact: {
      render: () => (
        <Section>
          <Contact />
        </Section>
      ),
    },
    Clients: {
      render: () => (
        <Section>
          <h2 className="msrd-u-visuallyHidden">Clients</h2>
          <Logos />
        </Section>
      ),
    },
    Footer: {
      render: Footer,
    },
    Header: {
      render: Header,
    },
    Hero: {
      fields: {
        strapline: { type: "text" },
        description: { type: "text" },
      },
      render: ({ description = "description", strapline = "strapline" }) => (
        <Section>
          <Hero description={description} strapline={strapline} />
        </Section>
      ),
    },
    Services: {
      render: () => (
        <Section>
          <h2 className="msrd-u-visuallyHidden" id="services">
            Services
          </h2>
          <Cards />
        </Section>
      ),
    },
    Space: {
      fields: {
        size: {
          options: [
            { label: "Default", value: "" },
            { label: "01", value: "01" },
            { label: "02", value: "02" },
            { label: "03", value: "03" },
            { label: "04", value: "04" },
            { label: "05", value: "05" },
            { label: "06", value: "06" },
            { label: "07", value: "07" },
            { label: "08", value: "08" },
            { label: "09", value: "09" },
            { label: "10", value: "10" },
            { label: "11", value: "11" },
            { label: "12", value: "12" },
          ],
          type: "select",
        },
      },
      render: Space,
    },
    Technologies: {
      render: () => (
        <Section>
          <Technologies />
        </Section>
      ),
    },
    Work: {
      fields: {
        client: { type: "text" },
        image: { type: "text" },
        project: { type: "text" },
        url: { type: "text" },
      },
      render: ({
        client = "client",
        image = "src.jpg",
        project = "project",
        url = "example.com",
      }) => (
        <Section>
          <Work client={client} image={image} project={project} url={url} />
        </Section>
      ),
    },
  },
};

export default config;
