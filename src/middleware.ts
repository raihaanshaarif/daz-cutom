import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Get authentication token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect authenticated users away from login page
  if (pathname === "/login" && token) {
    const callbackUrl = searchParams.get("callbackUrl");
    if (
      callbackUrl &&
      callbackUrl !== "/login" &&
      !callbackUrl.startsWith("/login?")
    ) {
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
