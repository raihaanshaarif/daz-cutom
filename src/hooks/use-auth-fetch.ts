import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect } from "react";

/**
 * Custom hook for making authenticated API calls from client components
 * Includes JWT rotation check and handles 401 unauthorized
 */
export function useAuthFetch() {
  const { data: session, status } = useSession();
  const backendToken = session?.backendToken;
  const error = session?.error;

  // Sign out if there's a refresh token error
  useEffect(() => {
    if (error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [error]);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (backendToken) {
        headers["Authorization"] = `Bearer ${backendToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        console.error("[AUTH] 401 Unauthorized detected - triggering logout");
        signOut({ callbackUrl: "/login" });
      }

      return response;
    },
    [backendToken],
  );

  return {
    authFetch,
    backendToken,
    isAuthenticated: !!backendToken,
    isLoading: status === "loading",
  };
}
