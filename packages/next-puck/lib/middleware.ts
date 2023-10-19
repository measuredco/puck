import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export const puckMiddleware = (req: NextRequest, { segment = "edit" } = {}) => {
  const res = NextResponse.next();

  if (req.method === "GET") {
    const segmentWithSlash = `/${segment}`;

    // Rewrite routes that match "/[...puckPath]/edit" to "/puck/[...puckPath]"
    if (req.nextUrl.pathname.endsWith(segmentWithSlash)) {
      const pathWithoutEdit = req.nextUrl.pathname.slice(
        0,
        req.nextUrl.pathname.length - (segment.length + 1)
      );
      const pathWithEditPrefix = `/puck${pathWithoutEdit}`;

      return NextResponse.rewrite(new URL(pathWithEditPrefix, req.url));
    }

    // Disable "/puck/[...puckPath]"
    if (req.nextUrl.pathname.startsWith("/puck")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
};
