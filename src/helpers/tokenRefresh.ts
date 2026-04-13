import { getSession } from "next-auth/react";

/**
 * Manually refresh the authentication token
 * Useful for ensuring a fresh token before making critical API calls
 */
export async function refreshAuthToken() {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("[TOKEN REFRESH] Initiating manual token refresh...");
    }

    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to refresh token: ${response.status} ${response.statusText}`,
      );
    }

    const session = await response.json();

    if (process.env.NODE_ENV === "development") {
      console.log("[TOKEN REFRESH] ✅ Token refresh successful", {
        email: session?.user?.email,
        hasBackendToken: !!session?.backendToken,
        hasRefreshToken: !!session?.refreshToken,
        error: session?.error || "none",
      });
    }

    return session;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[TOKEN REFRESH] ❌ Failed to refresh token:",
        error instanceof Error ? error.message : error,
      );
    }
    throw error;
  }
}

/**
 * Get current session with refresh token available
 * Always attempts to get the latest session
 */
export async function getSessionWithRefreshToken() {
  const session = await getSession();

  if (!session) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[SESSION] No active session found");
    }
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[SESSION] Current session state:", {
      email: session.user?.email,
      hasBackendToken: !!session.backendToken,
      hasRefreshToken: !!session.refreshToken,
      error: session.error || "none",
    });
  }

  return session;
}

/**
 * Check if refresh token is available and valid
 */
export async function hasValidRefreshToken(): Promise<boolean> {
  try {
    const session = await getSession();
    const hasRefreshToken = !!session?.refreshToken;
    const isLoggedIn = !!session?.user;

    if (process.env.NODE_ENV === "development") {
      console.log("[TOKEN CHECK] Refresh token status:", {
        isLoggedIn,
        hasRefreshToken,
        email: session?.user?.email,
      });
    }

    return isLoggedIn && hasRefreshToken;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[TOKEN CHECK] Error checking refresh token:", error);
    }
    return false;
  }
}
