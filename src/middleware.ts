import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Break /login redirect loop: if callbackUrl resolves to /login, strip it
  if (pathname === "/login") {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl) {
      try {
        const decoded = decodeURIComponent(callbackUrl);
        const isLoginLoop =
          decoded === "/login" ||
          decoded.startsWith("/login?") ||
          decoded.startsWith("/login/");
        if (isLoginLoop) {
          const url = req.nextUrl.clone();
          url.searchParams.delete("callbackUrl");
          return NextResponse.redirect(url);
        }
      } catch {
        // ignore malformed callbackUrl
      }
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set(
        "callbackUrl",
        req.nextUrl.pathname + req.nextUrl.search,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
