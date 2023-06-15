import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import resolvePuckPath from "./resolve-puck-path";
import { Metadata } from "next";
import { Framework, validFrameworks } from "../../Framework";

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
      title: "Puck: " + path,
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

  if (validFrameworks.indexOf(params.framework) === -1) {
    return notFound();
  }

  return (
    <Client
      isEdit={isEdit}
      path={path}
      framework={params.framework as Framework}
    />
  );
}
