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
    if (error === "RefreshTokenError") {
      console.error("[AUTH] Refresh token error detected - triggering logout");
      signOut({ callbackUrl: "/login" });
    }
  }, [error]);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // Wait for session to be ready - prevent race condition
      if (status === "loading") {
        throw new Error(
          "Cannot make authenticated request while session is loading. Use isLoading to wait for authentication.",
        );
      }

      if (status === "unauthenticated") {
        console.error("[AUTH] User is not authenticated");
        signOut({ callbackUrl: "/login" });
        throw new Error("User is not authenticated");
      }

      if (!backendToken) {
        console.error("[AUTH] No backend token available");
        signOut({ callbackUrl: "/login" });
        throw new Error("No authentication token available");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${backendToken}`,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.error("[AUTH] 401 Unauthorized - triggering logout");
        signOut({ callbackUrl: "/login" });
        throw new Error("Authentication failed");
      }

      return response;
    },
    [backendToken, status],
  );

  return {
    authFetch,
    backendToken,
    isAuthenticated: !!backendToken,
    isLoading: status === "loading",
  };
}
