import { type Config } from "@measured/puck";

type Props = {
  HeadingBlock: { title: string };
  Flex: {};
};

export const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: "text" },
      },
      defaultProps: {
        title: "Heading",
      },
      render: ({ title }) => (
        <div style={{ padding: 64 }}>
          <h1>{title}</h1>
        </div>
      ),
    },
    Flex: {
      render: ({ puck: { renderDropZone: DropZone } }) => (
        <DropZone zone="flex" />
      ),
    },
  },
};

export default config;
