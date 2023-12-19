import type { AppProps } from "next/app";
import "../styles.css";

export default function DocsApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
