import { useEffect, useRef } from "react";

export type Message = {
  type: "routeChange";
  url?: string;
  title: string;
};

export default function Version({ path, version }) {
  useEffect(() => {
    const handleMessageReceived = (event: MessageEvent) => {
      if (event.data.type === "routeChange") {
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
  }, []);

  const versionSlug = version.replace(/\./g, "");

  const src =
    version === "canary"
      ? `https://puck-docs-git-main-measured.vercel.app/${path}`
      : `https://puck-docs-git-releases-v${versionSlug}-measured.vercel.app/${path}`;

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
