import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.error("Email or Password is missing");
          return null;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            },
          );

          if (!res?.ok) {
            console.error("Login Failed", await res.text());
            return null;
          }

          const response = await res.json();
          const { user, accessToken, refreshToken } = response.data;

          console.log("[LOGIN DEBUG] Backend token received:", accessToken);

          if (user?.id) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.picture,
              backendToken: accessToken,
              refreshToken: refreshToken,
            };
          } else {
            return null;
          }
        } catch (err) {
          console.error(err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth - send to backend for JWT token
      if (account?.provider === "google") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/auth/google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: user.name,
                email: user.email,
                picture: user.image,
              }),
            },
          );

          if (res.ok) {
            const { data } = await res.json();
            // Store backend tokens in user object
            user.backendToken = data?.accessToken;
            user.refreshToken = data?.refreshToken;
            user.id = data?.user?.id?.toString();
            user.role = data?.user?.role;
          }
        } catch (error) {
          console.error("Error authenticating with backend:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      console.log(
        "[JWT DEBUG] JWT callback called for:",
        token?.email || "unknown",
        "user:",
        !!user,
        "account:",
        !!account,
      );

      // Initial sign-in
      if (user && account) {
        console.log("[AUTH DEBUG] Initial sign-in for user:", user.email);
        return {
          ...token,
          id: user.id,
          role: user.role,
          backendToken: user.backendToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
        };
      }

      // Check if backend token needs refresh (expires in 10 minutes or less)
      if (
        token.accessTokenExpires &&
        Date.now() > (token.accessTokenExpires as number) - 10 * 60 * 1000
      ) {
        console.log(
          "[AUTH DEBUG] Backend token expiring soon, attempting refresh for:",
          token.email,
        );
        try {
          if (!token.refreshToken) {
            console.error("[AUTH DEBUG] No refresh token available");
            throw new Error("Missing refresh token");
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API}/auth/refresh-token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refreshToken: token.refreshToken,
              }),
            },
          );

          const refreshedTokens = await response.json();

          if (!response.ok) {
            console.error(
              "[AUTH DEBUG] Token refresh failed:",
              refreshedTokens,
            );
            throw new Error("Token refresh failed");
          }

          console.log("[AUTH DEBUG] Token refreshed successfully");
          return {
            ...token,
            backendToken: refreshedTokens.data.accessToken,
            refreshToken:
              refreshedTokens.data.refreshToken || token.refreshToken,
            accessTokenExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
          };
        } catch (error) {
          console.error("[AUTH] Token refresh error:", error);
          return {
            ...token,
            error: "RefreshTokenError",
          };
        }
      }

      console.log(
        "[JWT DEBUG] Returning token as-is for:",
        token?.email || "unknown",
      );
      // Token is still valid, return as-is
      return token;
    },
    async session({ session, token }) {
      console.log(
        "[SESSION DEBUG] Session callback called for:",
        token?.email || "unknown",
      );
      console.log(
        "[SESSION DEBUG] Token has backendToken:",
        !!token?.backendToken,
      );
      console.log(
        "[SESSION DEBUG] Token preview:",
        token?.backendToken
          ? token.backendToken.toString().substring(0, 20) + "..."
          : "NONE",
      );
      if (session?.user) {
        session.user.id = token?.id as string;
        session.user.role = token?.role as string;
      }
      // Add custom properties to session
      session.backendToken = token?.backendToken as string;
      session.refreshToken = token?.refreshToken as string;
      session.error = token?.error as string;
      console.log(
        "[SESSION DEBUG] Session prepared with backendToken:",
        !!session.backendToken,
      );
      return session;
    },
    async redirect({ url, baseUrl }) {
      const loginPath = "/login";
      const absoluteUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
      try {
        const urlObj = new URL(absoluteUrl);
        if (urlObj.pathname === loginPath) {
          const rawCallback = urlObj.searchParams.get("callbackUrl");
          if (rawCallback) {
            try {
              const decoded = decodeURIComponent(rawCallback);
              const absoluteCallback = decoded.startsWith("/")
                ? `${baseUrl}${decoded}`
                : decoded;
              const callbackObj = new URL(absoluteCallback);
              if (callbackObj.pathname === loginPath) {
                return `${baseUrl}${loginPath}`;
              }
            } catch {
              // if parsing fails, strip to be safe
              return `${baseUrl}${loginPath}`;
            }
          }
        }
      } catch {
        // ignore malformed url
      }
      // Default NextAuth behaviour
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {
        // ignore
      }
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: {
    signIn: "/login",
  },
};
