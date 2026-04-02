import { useSession } from "next-auth/react";
import { useCallback } from "react";

/**
 * Custom hook for making authenticated API calls from client components
 * Automatically includes the JWT token in the Authorization header
 */
export function useAuthFetch() {
  const { data: session } = useSession();
  const backendToken = (session as any)?.backendToken;

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      // Add Authorization header if backend token exists
      if (backendToken) {
        headers["Authorization"] = `Bearer ${backendToken}`;
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [backendToken],
  );

  return { authFetch, backendToken, isAuthenticated: !!backendToken };
}
