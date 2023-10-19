import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import config from "../../../next-puck.config";

export async function POST(request: Request) {
  // We clone the request so the user can read the JSON again in writePageServer
  const payload = await request.clone().json();

  if (config.writePageServer) {
    await config.writePageServer(request);
  }

  // Purge Next.js cache
  revalidatePath(payload.path);

  return NextResponse.json({ status: "ok" });
}
