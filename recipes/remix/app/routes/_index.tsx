import { Render } from "@measured/puck";
import styles from "@measured/puck/dist/index.css";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, LinksFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import puckConfig from "../../puck.config";
import { getPage } from "~/models/page.server";

/**
 * Disable client-side JS - Optional
 * If you know that your Puck content doesn't need react.
 * Then you can disable JS for this route.
 * @see https://remix.run/docs/en/main/guides/disabling-javascript
 */

// export const handle = { hydrate: false };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // Get path, and default to slash for root path.
  const puckPath = params.puckPath || "/";
  // Get puckData for this path, this could be a database call.
  const puckData = getPage(puckPath);
  if (!puckData) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  // Return the data.
  return json({ puckData });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.puckData?.root?.title || "Untitled page";

  return [{ title }];
};

export default function Page() {
  const { puckData } = useLoaderData<typeof loader>();

  /**
   * TypeStript error
   * Type 'Config<Props>' is not assignable to type 'Config'.
   * @see https://github.com/measuredco/puck/issues/185
   */

  return <Render config={puckConfig} data={puckData} />;
}
