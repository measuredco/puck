import dynamic from "next/dynamic";
import { Metadata } from "next";
import { getAllPathParams, getPageData } from "./actions";
import { notFound } from "next/navigation";
import { ClientRender } from "./render";
import resolvePuckPath from "./resolve-puck-path";

const Client = dynamic(() => import("./client"), {
  ssr: false,
});

export async function generateStaticParams() {
  return getAllPathParams();
}

export async function generateMetadata({
  params,
}: {
  params: { framework: string; uuid: string; puckPath: string[] };
}): Promise<Metadata> {
  const { suffix, path } = resolvePuckPath(params.puckPath);

  if (suffix === "edit") {
    return {
      title: "Editing: " + path,
    };
  }

  if (suffix === "preview") {
    return {
      title: "Preview: " + path,
    };
  }

  const data = await getPageData(path);

  return {
    title: data?.root.title || "",
  };
}

export default async function Page({
  params,
}: {
  params: { framework: string; uuid: string; puckPath: string[] };
}) {
  const { suffix, path } = resolvePuckPath(params.puckPath);

  const data = await getPageData(path);

  if (suffix) {
    return <Client path={path} data={data} isEdit={suffix === "edit"} />;
  }

  if (!data) {
    return notFound();
  }

  return <ClientRender data={data} />;
}
