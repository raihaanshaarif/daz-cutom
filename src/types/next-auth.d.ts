import "next-auth";
import { DefaultSession } from "next-auth";

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
    id: string;
    backendToken?: string;
    refreshToken?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    backendToken?: string;
    refreshToken?: string;
    error?: string;
  }
}
