import resolvePuckPath from "../../lib/resolve-puck-path";
import { Metadata } from "next";
import Client from "./client";
import "@measured/puck/puck.css"; // Editor wasn't rendering styles without this  
export async function generateMetadata({
  params,
}: {
  params: Promise<{ framework: string; uuid: string; puckPath: string[] }>;
}): Promise<Metadata> {
  const { puckPath } = await params;
  const { isEdit, path } = resolvePuckPath(puckPath);

  if (isEdit) {
    return {
      title: "Editing: " + path,
    };
  }

  return {
    title: "",
  };
}

const getExternalData = async () => {
  return {
    heading: "Transform your content right before rendering",
    text: "Using external data, you can now substitute content prior to rendering while leaving your original data intact.",
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ framework: string; uuid: string; puckPath: string[] }>;
}) {
  const { puckPath } = await params;
  const { isEdit, path } = resolvePuckPath(puckPath);
  const externalData = await getExternalData();

  return <Client isEdit={isEdit} path={path} externalData={externalData} />;
}
