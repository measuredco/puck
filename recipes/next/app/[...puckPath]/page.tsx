import { Client } from "./client";
import { notFound } from "next/navigation";
import resolvePuckPath from "./resolve-puck-path";
import { Metadata } from "next";
import { Data } from "@measured/puck";
import fs from "fs";

// Replace with call to your database
const getPage = (path: string) => {
  const allData: Record<string, Data> | null = fs.existsSync("database.json")
    ? JSON.parse(fs.readFileSync("database.json", "utf-8"))
    : null;

  return allData ? allData[path] : null;
};

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

  return {
    title: getPage(path)?.root.title,
  };
}

export default async function Page({
  params,
}: {
  params: { puckPath: string[] };
}) {
  const { isEdit, path } = resolvePuckPath(params.puckPath);

  const data = getPage(path);

  if (!data && !isEdit) {
    return notFound();
  }

  return <Client isEdit={isEdit} path={path} data={data} />;
}
