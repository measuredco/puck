import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const data = fs.existsSync("database.json")
    ? fs.readFileSync("database.json", "utf-8")
    : null;

  return NextResponse.json(JSON.parse(data || "[]"));
}

export async function POST(request: Request) {
  const data = await request.json();

  fs.writeFileSync("database.json", JSON.stringify(data));

  return NextResponse.json({ status: "ok" });
}

export const revalidate = 0;
