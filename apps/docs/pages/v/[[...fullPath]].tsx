import { useEffect, useState } from "react";

export type Message = {
  type: "routeChange";
  url?: string;
  title: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://puckeditor.com";

export default function Version({ path, version = "" }) {
  const [base, setBase] = useState("");

  const src = `${base}/${path}`;

  useEffect(() => {
    fetch(`${BASE_URL}/api/releases`).then(async (res) => {
      const { releases } = await res.json();

      setBase(
        version === "canary"
          ? `https://puck-docs-git-main-measured.vercel.app`
          : releases[version]
      );
    });
  }, [version]);

  useEffect(() => {
    if (!base) return;

    const handleMessageReceived = (event: MessageEvent) => {
      if (event.data.type === "routeChange") {
        if (event.origin !== base) {
          console.warn(
            `Origin does not match expected target: ${event.origin} vs ${base}`
          );

          return;
        }

        const routeChange = event.data as Message;

        if (routeChange.url) {
          window.history.pushState({}, "", `/v/${version}${routeChange.url}`);
        }

        window.document.title = `${routeChange.title} [${
          version !== "canary" ? `v${version}` : version
        }]`;
      }
    };

    window.addEventListener("message", handleMessageReceived);

    return () => window.removeEventListener("message", handleMessageReceived);
  }, [base, version]);

  if (!base) return <div />;

  return (
    <iframe
      src={src}
      style={{
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
        position: "fixed",
        border: 0,
      }}
    ></iframe>
  );
}

export function getServerSideProps(ctx) {
  const [version, ...path] = ctx.query.fullPath;

  return { props: { path: path.join("/"), version } };
}
