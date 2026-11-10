
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return new NextResponse("Admin configuration missing", {
      status: 503,
    });
  }

  const basicAuth = request.headers.get("authorization");

  if (basicAuth?.startsWith("Basic ")) {
    try {
      const decoded = atob(basicAuth.slice(6));
      const separator = decoded.indexOf(":");

      if (separator !== -1) {
        const user = decoded.slice(0, separator);
        const pass = decoded.slice(separator + 1);

        if (user === username && pass === password) {
          return NextResponse.next();
        }
      }
    } catch {
      // Invalid authorization header
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="LA VIE Admin"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
