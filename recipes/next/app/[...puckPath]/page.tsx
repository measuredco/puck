import { Client } from "./client";
import { notFound } from "next/navigation";
import resolvePuckPath from "./resolve-puck-path";
import { Metadata } from "next";
import { Data } from "@measured/puck/types/Config";

export async function generateMetadata({
  params,
}: {
  params: { puckPath: string[] };
}): Promise<Metadata> {
  const { isEdit, path } = resolvePuckPath(params.puckPath);

  if (isEdit) {
    return {
      title: "Puck: " + path,
    };
  }

  const data: Data = (
    await fetch("http://localhost:3000/api/puck", {
      next: { revalidate: 0 },
    }).then((d) => d.json())
  )[path];

  return {
    title: data?.root?.title,
  };
}

export default async function Page({
  params,
}: {
  params: { puckPath: string[] };
}) {
  const { isEdit, path } = resolvePuckPath(params.puckPath);

  const data = (
    await fetch("http://localhost:3000/api/puck", {
      next: { revalidate: 0 },
    }).then((d) => d.json())
  )[path];

  if (!data && !isEdit) {
    return notFound();
  }

  return <Client isEdit={isEdit} path={path} data={data} />;
}
