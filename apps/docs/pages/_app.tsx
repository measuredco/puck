import React, { useEffect } from "react";

import type { AppProps } from "next/app";
import "../styles.css";
import { useRouter } from "next/router";
import { Message } from "./v/[[...fullPath]]";

export default function DocsApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (!window || window.parent === window) return;

    const message: Message = {
      type: "routeChange",
      title: window.document.title,
    };

    window.parent.postMessage(message);

    const handleRouteChange = (url) => {
      const message: Message = {
        type: "routeChange",
        url,
        title: window.document.title,
      };

      window.parent.postMessage(message, "https://puckeditor.com");
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return <Component {...pageProps} />;
}
