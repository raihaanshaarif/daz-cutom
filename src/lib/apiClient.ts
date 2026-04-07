import { getServerSession } from "next-auth";
import { authOptions } from "@/helpers/authOptions";

/**
 * Authenticated fetch wrapper for server-side API calls
 * Automatically includes Authorization header with backend JWT token
 * Includes handle for 401 Unauthorized errors
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized globally for server-side fetches (e.g., in Server Actions)
  if (response.status === 401) {
    console.error(`[API] 401 Unauthorized on server for: ${url}`);
    // Note: We can't use signOut() directly here if this is purely a server context,
    // but NextAuth session handling will eventually catch it.
  }

  return response;
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
