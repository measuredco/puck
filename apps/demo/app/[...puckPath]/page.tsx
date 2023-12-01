import dynamic from "next/dynamic";
import resolvePuckPath from "../../lib/resolve-puck-path";
import { Metadata } from "next";

const Client = dynamic(() => import("./client"), {
  ssr: false,
});

export async function generateMetadata({
  params,
}: {
  params: { framework: string; uuid: string; puckPath: string[] };
}): Promise<Metadata> {
  const { isEdit, path } = resolvePuckPath(params.puckPath);

  if (isEdit) {
    return {
      title: "Editing: " + path,
    };
  }

  return {
    title: "",
  };
}

export default async function Page({
  params,
}: {
  params: { framework: string; uuid: string; puckPath: string[] };
}) {
  const { isEdit, path } = resolvePuckPath(params.puckPath);

  return <Client isEdit={isEdit} path={path} />;
}
