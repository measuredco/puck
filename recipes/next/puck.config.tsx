import type { Config } from "@measured/puck";

export const config: Config<{
  Paragraph: { text: string };
  Columns: {};
}> = {
  root: {
    fields: {
      title: {
        type: "text",
      },
    },
    defaultProps: {
      title: "Title",
    },
    render: ({ title, children }) => {
      return (
        <div style={{ padding: "3rem" }}>
          <h1>{title}</h1>
          {children}
        </div>
      );
    },
  },
  components: {
    Columns: {
      render: ({ puck: { renderDropZone } }) => {
        return (
          <div style={{ display: "flex", gap: "3rem" }}>
            <div style={{ flexGrow: 1 }}>{renderDropZone({ zone: "0" })}</div>
            <div style={{ flexGrow: 1 }}>{renderDropZone({ zone: "1" })}</div>
          </div>
        );
      },
    },
    Paragraph: {
      fields: {
        text: {
          type: "textarea",
        },
      },
      defaultProps: {
        text: "Lorem ipsum.",
      },
      render: ({ text }) => <p>{text}</p>,
    },
  },
};

export default config;
