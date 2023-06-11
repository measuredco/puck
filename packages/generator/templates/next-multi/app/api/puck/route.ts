import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const data = fs.existsSync("database.json")
    ? fs.readFileSync("database.json", "utf-8")
    : null;

  return NextResponse.json(JSON.parse(data || "{}"));
}

export async function POST(request: Request) {
  const data = await request.json();

  const existingData = JSON.parse(
    fs.existsSync("database.json")
      ? fs.readFileSync("database.json", "utf-8")
      : "{}"
  );

  const updatedData = {
    ...existingData,
    ...data,
  };

  fs.writeFileSync("database.json", JSON.stringify(updatedData));

  return NextResponse.json({ status: "ok" });
}

export const revalidate = 0;
