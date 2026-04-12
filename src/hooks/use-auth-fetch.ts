import { useSession, signOut, getSession } from "next-auth/react";
import { useCallback, useEffect } from "react";

/**
 * Custom hook for making authenticated API calls from client components
 * Includes JWT rotation check and handles 401 unauthorized with retry logic
 */
export function useAuthFetch() {
  const { data: session, status, update: updateSession } = useSession();
  const backendToken = session?.backendToken;
  const error = session?.error;

  // Sign out if there's a refresh token error
  useEffect(() => {
    if (error === "RefreshTokenError") {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[AUTH] Refresh token error detected - triggering logout",
        );
      }
      signOut({ callbackUrl: "/login" });
    }
  }, [error]);

  const authFetch = useCallback(
    async (
      url: string,
      options: RequestInit = {},
      retryCount: number = 0,
    ): Promise<Response> => {
      // Wait for session to be ready - prevent race condition
      if (status === "loading") {
        throw new Error(
          "Cannot make authenticated request while session is loading. Use isLoading to wait for authentication.",
        );
      }

      if (status === "unauthenticated") {
        if (process.env.NODE_ENV === "development") {
          console.error("[AUTH] User is not authenticated");
        }
        signOut({ callbackUrl: "/login" });
        throw new Error("User is not authenticated");
      }

      if (!backendToken) {
        if (process.env.NODE_ENV === "development") {
          console.error("[AUTH] No backend token available");
        }
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

      // Handle 401 Unauthorized - try to refresh token and retry
      if (response.status === 401) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[AUTH] 401 Unauthorized on ${url} - attempting token refresh (retry count: ${retryCount})`,
          );
        }

        // Prevent infinite retry loops (max 1 retry)
        if (retryCount >= 1) {
          if (process.env.NODE_ENV === "development") {
            console.error(
              "[AUTH] 401 persisted after token refresh - logging out",
            );
          }
          signOut({ callbackUrl: "/login" });
          throw new Error("Authentication failed - token refresh unsuccessful");
        }

        try {
          // Trigger NextAuth JWT callback to refresh token
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[AUTH] Requesting session update to trigger token refresh",
            );
          }
          await updateSession();

          // Get fresh session with updated token
          const freshSession = await getSession();

          if (!freshSession?.backendToken) {
            if (process.env.NODE_ENV === "development") {
              console.error("[AUTH] No token available after refresh attempt");
            }
            signOut({ callbackUrl: "/login" });
            throw new Error("Token refresh failed - no token in session");
          }

          // Retry the request with the new token
          if (process.env.NODE_ENV === "development") {
            console.log("[AUTH] Retrying request with refreshed token");
          }
          const retryHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
            Authorization: `Bearer ${freshSession.backendToken}`,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          if (retryResponse.status === 401) {
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[AUTH] 401 still after retry - token refresh failed",
              );
            }
            signOut({ callbackUrl: "/login" });
            throw new Error("Authentication failed after token refresh");
          }

          if (process.env.NODE_ENV === "development") {
            console.log("[AUTH] Request successful after token refresh");
          }
          return retryResponse;
        } catch (refreshError) {
          if (process.env.NODE_ENV === "development") {
            console.error("[AUTH] Token refresh/retry failed:", refreshError);
          }
          signOut({ callbackUrl: "/login" });
          throw refreshError;
        }
      }

      return response;
    },
    [backendToken, status, updateSession],
  );

  return {
    authFetch,
    backendToken,
    isAuthenticated: !!backendToken,
    isLoading: status === "loading",
  };
}
