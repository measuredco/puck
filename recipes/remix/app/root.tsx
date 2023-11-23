import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  // useMatches,
} from "@remix-run/react";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  /**
   * Disable client-side JS - Optional
   * @see https://remix.run/docs/en/main/guides/disabling-javascript
   */
  // const matches = useMatches();
  // const includeScripts = matches.some((match) => match.handle?.hydrate);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        {/* Conditionally render scripts - Optional */}
        {/* {includeScripts ? <Scripts /> : null} */}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
