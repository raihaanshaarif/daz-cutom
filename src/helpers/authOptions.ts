import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

console.log("[AUTH OPTIONS] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log(
  "[AUTH OPTIONS] NEXTAUTH_SECRET configured:",
  !!process.env.NEXTAUTH_SECRET,
);
console.log("[AUTH OPTIONS] Environment:", process.env.NODE_ENV);

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
          if (process.env.NODE_ENV === "development") {
            console.error("Email or Password is missing");
          }
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
            if (process.env.NODE_ENV === "development") {
              console.error("Login Failed", await res.text());
            }
            return null;
          }

          const response = await res.json();
          const { user, accessToken, refreshToken } = response.data;

          if (process.env.NODE_ENV === "development") {
            console.log("[LOGIN DEBUG] Backend token received:", accessToken);
          }

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
          if (process.env.NODE_ENV === "development") {
            console.error("[LOGIN] Error:", err);
          }
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
          if (process.env.NODE_ENV === "development") {
            console.error("[SIGNIN] Error authenticating with backend:", error);
          }
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account: _account }) {
      // console.log(
      //   "[JWT DEBUG] JWT callback called for:",
      //   token?.email || "unknown",
      //   "user:",
      //   !!user,
      //   "account:",
      //   !!account,
      // );

      // Initial sign-in
      if (user) {
        if (process.env.NODE_ENV === "development") {
          console.log("[JWT] Initial sign-in for user:", user.email);
          console.log("[JWT] Tokens received:", {
            hasBackendToken: !!user.backendToken,
            hasRefreshToken: !!user.refreshToken,
            backendTokenPreview: user.backendToken
              ? user.backendToken.substring(0, 20) + "..."
              : "NONE",
            refreshTokenPreview: user.refreshToken
              ? user.refreshToken.substring(0, 20) + "..."
              : "NONE",
          });
        }

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
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[AUTH] Backend token expiring soon, attempting refresh for:",
            token.email,
            "Current time:",
            new Date(Date.now()).toISOString(),
            "Token expires at:",
            new Date(token.accessTokenExpires as number).toISOString(),
          );
        }
        try {
          if (!token.refreshToken) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[AUTH] CRITICAL: No refresh token available in JWT token",
                {
                  email: token.email,
                  hasBackendToken: !!token.backendToken,
                  hasRefreshToken: !!token.refreshToken,
                  tokenKeys: Object.keys(token),
                },
              );
            }
            throw new Error(
              "Missing refresh token - cannot refresh access token. User will need to login again.",
            );
          }

          if (process.env.NODE_ENV === "development") {
            console.log(
              "[AUTH] Calling /auth/refresh-token with refresh token",
            );
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
            if (process.env.NODE_ENV === "development") {
              console.error("[AUTH] Token refresh API failed:", {
                status: response.status,
                response: refreshedTokens,
                email: token.email,
              });
            }
            throw new Error(
              `Token refresh failed: ${refreshedTokens.message || "Unknown error"}`,
            );
          }

          if (!refreshedTokens.data?.accessToken) {
            if (process.env.NODE_ENV === "development") {
              console.error("[AUTH] Backend returned no access token:", {
                response: refreshedTokens,
                email: token.email,
              });
            }
            throw new Error(
              "Backend returned no access token in refresh response",
            );
          }

          if (process.env.NODE_ENV === "development") {
            console.log(
              "[AUTH] ✅ Token refreshed successfully for:",
              token.email,
              {
                newRefreshToken: !!refreshedTokens.data.refreshToken,
                preservedRefreshToken: !!token.refreshToken,
              },
            );
          }

          // IMPORTANT: Always preserve refresh token - either use new one or keep existing
          const preservedRefreshToken =
            refreshedTokens.data.refreshToken || token.refreshToken;

          if (
            process.env.NODE_ENV === "development" &&
            !preservedRefreshToken
          ) {
            console.warn(
              "[AUTH] ⚠️ WARNING: No refresh token preserved after token refresh!",
              { email: token.email },
            );
          }

          return {
            ...token,
            backendToken: refreshedTokens.data.accessToken,
            refreshToken: preservedRefreshToken,
            accessTokenExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
          };
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("[AUTH] ❌ Token refresh failed:", {
              error: error instanceof Error ? error.message : error,
              email: token.email,
              hasRefreshToken: !!token.refreshToken,
            });
          }
          return {
            ...token,
            error: "RefreshTokenError",
          };
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[JWT] Token still valid for:", token?.email || "unknown", {
          expiresAt: token?.accessTokenExpires
            ? new Date(token.accessTokenExpires as number).toISOString()
            : "unknown",
          hasRefreshToken: !!token?.refreshToken,
        });
      }
      // Token is still valid, return as-is (preserving all properties including refreshToken)
      return token;
    },
    async session({ session, token }) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[SESSION] Session callback - preparing session for:",
          token?.email || "unknown",
        );
        console.log("[SESSION] Token state:", {
          hasBackendToken: !!token?.backendToken,
          hasRefreshToken: !!token?.refreshToken,
          hasError: !!token?.error,
          errorMessage: token?.error || "none",
        });
      }

      if (session?.user) {
        session.user.id = token?.id as string;
        session.user.role = token?.role as string;
      }

      // Add custom properties to session
      session.backendToken = token?.backendToken as string;
      session.refreshToken = token?.refreshToken as string;
      session.error = token?.error as string;

      if (process.env.NODE_ENV === "development") {
        console.log("[SESSION] ✅ Session prepared:", {
          email: token?.email,
          hasBackendToken: !!session.backendToken,
          hasRefreshToken: !!session.refreshToken,
          error: session.error || "none",
        });
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[REDIRECT CALLBACK]", { url, baseUrl });

      // Always redirect to dashboard on successful sign-in
      // The url passed here is what would normally be redirected to
      // We override it to always go to dashboard unless it's an external URL

      try {
        const urlObj = new URL(url);
        // Only allow same-origin URLs
        if (urlObj.origin === new URL(baseUrl).origin || url.startsWith("/")) {
          // For any same-origin URL during login, go to dashboard
          return `${baseUrl}/dashboard`;
        }
      } catch {
        // If URL parsing fails, it's likely a relative path
      }

      // Default: redirect to dashboard
      return `${baseUrl}/dashboard`;
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
