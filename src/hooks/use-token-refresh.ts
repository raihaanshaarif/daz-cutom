"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { refreshAuthToken, hasValidRefreshToken } from "@/helpers/tokenRefresh";

/**
 * Hook to manage token refresh in client components
 * Provides convenience methods to check token status and manually refresh
 */
export function useTokenRefresh() {
  const { data: session, update: updateSession } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (process.env.NODE_ENV === "development") {
      console.log("[HOOK] Initiating token refresh via hook...");
    }

    setIsRefreshing(true);
    setRefreshError(null);

    try {
      // Update session which triggers NextAuth JWT callback for token refresh
      const result = await updateSession();

      if (!result?.backendToken) {
        throw new Error("Failed to obtain fresh backend token after refresh");
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[HOOK] ✅ Token refresh successful via hook", {
          hasBackendToken: !!result.backendToken,
          hasRefreshToken: !!result.refreshToken,
          error: result.error || "none",
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setRefreshError(errorMessage);

      if (process.env.NODE_ENV === "development") {
        console.error("[HOOK] ❌ Token refresh failed:", errorMessage);
      }

      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [updateSession]);

  const checkRefreshTokenAvailable = useCallback(async () => {
    const hasToken = await hasValidRefreshToken();

    if (process.env.NODE_ENV === "development") {
      console.log("[HOOK] Refresh token availability check:", {
        hasToken,
        email: session?.user?.email,
      });
    }

    return hasToken;
  }, [session?.user?.email]);

  const getTokenStatus = useCallback(() => {
    return {
      hasBackendToken: !!session?.backendToken,
      hasRefreshToken: !!session?.refreshToken,
      isRefreshValid: !!session?.refreshToken && !session?.error,
      hasError: !!session?.error,
      error: session?.error || null,
    };
  }, [session]);

  return {
    session,
    isRefreshing,
    refreshError,
    refresh,
    checkRefreshTokenAvailable,
    getTokenStatus,
  };
}
