import { puckMiddleware } from "@measured/next-puck";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  return puckMiddleware(req);
}
