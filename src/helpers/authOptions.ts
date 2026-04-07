import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    };
    backendToken?: string;
    refreshToken?: string;
    error?: string;
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    backendToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    backendToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

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

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      console.log(
        "[AUTH DEBUG] Token expired, attempting rotation for:",
        token.email,
      );
      // Access token has expired, try to update it
      try {
        if (!token.refreshToken) {
          console.error(
            "[AUTH DEBUG] No refresh token available in JWT for rotation",
          );
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
          throw refreshedTokens;
        }

        return {
          ...token,
          backendToken: refreshedTokens.data.accessToken,
          accessTokenExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
        };
      } catch (error) {
        console.error("[AUTH] RefreshAccessTokenError", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token?.id as string;
        session.user.role = token?.role as string;
        session.backendToken = token?.backendToken as string;
        session.refreshToken = token?.refreshToken as string;
        session.error = token?.error as string;
      }
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
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
  },
};
