import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Log all cookies for debugging - only in development
  if (process.env.NODE_ENV === "development") {
    const allCookies = req.cookies.getAll();
    const cookieNames = allCookies.map((c) => c.name);
    console.log(
      "[MIDDLEWARE DEBUG] Cookies found:",
      cookieNames.length,
      "names:",
      cookieNames.join(", ") || "NONE",
    );
  }

  // Get authentication token - let NextAuth determine the correct cookie name
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      "Middleware - Path:",
      pathname,
      "Token exists:",
      !!token,
      "Token details:",
      token
        ? {
            id: token.id,
            email: token.email,
            backendToken: !!token.backendToken,
          }
        : "none",
    );
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login" && token) {
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
