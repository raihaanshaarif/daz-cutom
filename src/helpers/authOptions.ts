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
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    backendToken?: string;
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
          // console.log("Response From Backend:", res);
          if (!res?.ok) {
            console.error("Login Failed", await res.text());
            return null;
          }

          const { data: user } = await res.json();
          if (user.id) {
            return {
              id: user?.id,
              name: user?.name,
              email: user?.email,
              role: user?.role,
              image: user?.picture,
              backendToken: user?.token,
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
    async signIn({ user, account, profile }) {
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
            // Store backend token in user object
            user.backendToken = data?.token;
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user?.id;
        token.role = user?.role;
        token.backendToken = user?.backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token?.id as string;
        session.user.role = token?.role as string;
        session.backendToken = token?.backendToken as string;
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
  pages: {
    signIn: "/login",
  },
};
