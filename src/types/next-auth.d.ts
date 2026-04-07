import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"];
    backendToken?: string;
    refreshToken?: string;
    error?: string;
  }

  interface User {
    backendToken?: string;
    refreshToken?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    backendToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
  }
}
