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
      console.log("[AUTH FETCH DEBUG] Making request to:", url);
      console.log("[AUTH FETCH DEBUG] backendToken exists:", !!backendToken);
      console.log(
        "[AUTH FETCH DEBUG] backendToken preview:",
        backendToken ? backendToken.substring(0, 20) + "..." : "NONE",
      );
      console.log("[AUTH FETCH DEBUG] Session status:", status);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (backendToken) {
        headers["Authorization"] = `Bearer ${backendToken}`;
        console.log("[AUTH FETCH DEBUG] Authorization header set");
      } else {
        console.error(
          "[AUTH FETCH DEBUG] NO BACKEND TOKEN - Request will fail!",
        );
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log("[AUTH FETCH DEBUG] Response status:", response.status);

      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        console.error("[AUTH] 401 Unauthorized detected");
        console.error("[AUTH] Had token:", !!backendToken);
        console.error("[AUTH] Session:", session);
        // Don't logout immediately - let's see what's happening
        // signOut({ callbackUrl: "/login" });
      }

      return response;
    },
    [backendToken, status, session],
  );

  return {
    authFetch,
    backendToken,
    isAuthenticated: !!backendToken,
    isLoading: status === "loading",
  };
}
