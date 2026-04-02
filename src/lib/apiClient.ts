import { getServerSession } from "next-auth";
import { authOptions } from "@/helpers/authOptions";

/**
 * Authenticated fetch wrapper for server-side API calls
 * Automatically includes Authorization header with backend JWT token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await getServerSession(authOptions);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if backend token exists
  if (session?.backendToken) {
    headers["Authorization"] = `Bearer ${session.backendToken}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Client-side authenticated fetch wrapper
 * Use this in client components with useSession hook
 */
export function createAuthenticatedFetch(token: string | undefined) {
  return async function (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };
}
