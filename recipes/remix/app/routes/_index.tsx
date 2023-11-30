import { Render, type Config } from "@measured/puck";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import puckConfig from "../../puck.config";
import { getPage } from "~/models/page.server";
import { getPuckPath } from "~/getPuckPath";

export const loader = async (args: LoaderFunctionArgs) => {
  const puckPath = getPuckPath(args);
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
  const title = data?.puckData?.root?.title || "Page";

  return [{ title }];
};

export default function Page() {
  const { puckData } = useLoaderData<typeof loader>();

  return <Render config={puckConfig as Config} data={puckData} />;
}
