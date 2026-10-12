import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/marketplace")) {
    const authCookie = request.cookies.get("resfood_auth_user");
    let isAuthenticated = false;

    if (authCookie?.value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(authCookie.value));
        if (parsed && (parsed.id || parsed.email)) {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("authModal", "true");
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/marketplace/:path*"],
};
