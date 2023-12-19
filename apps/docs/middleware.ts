import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import releases from "./releases.json";

const versionPattern = /\/v\/([\d+|\.]+|canary)/;

export function middleware(request: NextRequest) {
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  const urlMatch = versionPattern.exec(request.url);

  if (urlMatch) {
    const version = urlMatch[1];
    const newUrl = `${releases[version]}${path}`;

    return NextResponse.rewrite(new URL(newUrl));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/v/:path*"],
};
