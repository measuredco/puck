export const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        paddingTop: 196,
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1156 }}>
        <h1 style={{ visibility: "hidden" }}>Puck</h1>

        <h2 style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.2 }}>
          The open-source visual editor for React
        </h2>
      </div>
      <div style={{ maxWidth: 896 }}>
        <div style={{ paddingTop: 24 }} />
        <p style={{ fontSize: 18, lineHeight: 1.5, opacity: 0.7 }}>
          Puck empowers developers to build amazing visual editing experiences
          into their own React application, powering the next generation of
          content tools, no-code builders and WYSIWYG editors.
        </p>
        <div style={{ paddingTop: 32 }} />
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <a
            style={{
              padding: "12px 16px",
              backgroundColor: "#2f539e",
              color: "white",
              display: "block",
              borderRadius: 8,
              fontWeight: 500,
            }}
            href="/docs/introduction"
          >
            Get started
          </a>
          <a
            style={{
              padding: "12px 16px",
              border: "1px solid currentColor",
              display: "block",
              borderRadius: 8,
              fontWeight: 500,
            }}
            href="https://puck-demo-measured.vercel.app/edit"
          >
            View demo
          </a>
        </div>{" "}
        <div style={{ paddingTop: 32 }} />
        <pre style={{ padding: 0, margin: 0 }}>
          <span style={{ userSelect: "none" }}>~ </span>npm i @measured/puck
          --save
        </pre>
      </div>
      <div style={{ paddingTop: 196 }} />
    </div>
  );
};
