# Token Refresh Implementation Guide

## Overview

Your authentication system now includes comprehensive token refresh logic. When a user logs in, both an access token and refresh token are obtained. The system automatically refreshes the access token before it expires, and the refresh token is preserved throughout the session.

## Key Components

### 1. **authOptions.ts** - JWT Callback Updates

The JWT callback now:

- ✅ Captures refresh token on initial login (from both Credentials and Google OAuth)
- ✅ Preserves refresh token through all token updates
- ✅ Automatically refreshes access token ~10 minutes before expiry
- ✅ Maintains refresh token across refreshes (uses new one if provided, otherwise preserves existing)
- ✅ Enhanced logging to track token state and refresh operations

### 2. **New: tokenRefresh.ts** - Utility Functions

Provides helper functions for token management:

```typescript
// Manually refresh the token
await refreshAuthToken();

// Get current session with refresh token info
const session = await getSessionWithRefreshToken();

// Check if refresh token is available and valid
const isValid = await hasValidRefreshToken();
```

### 3. **New: useTokenRefresh Hook** - Client-Side Token Management

Use in client components to manage token refresh:

```typescript
"use client";
import { useTokenRefresh } from "@/hooks/use-token-refresh";

export function MyComponent() {
  const {
    session,           // Current session data
    refresh,           // Function to manually refresh token
    getTokenStatus,    // Get token availability status
    isRefreshing,      // Loading state while refreshing
    refreshError,      // Any refresh errors
  } = useTokenRefresh();

  const handleCriticalOperation = async () => {
    try {
      const status = getTokenStatus();
      console.log("Token Status:", status);

      if (status.hasRefreshToken) {
        await refresh();
        console.log("Token refreshed successfully");
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  };

  return (
    <button onClick={handleCriticalOperation} disabled={isRefreshing}>
      {isRefreshing ? "Refreshing..." : "Perform Action"}
    </button>
  );
}
```

### 4. **Enhanced: useAuthFetch Hook**

Now exposes:

- `refreshToken` - The refresh token (if available)
- `hasRefreshToken` - Boolean indicator
- `authError` - Any auth-related errors

```typescript
const {
  authFetch,
  backendToken,
  refreshToken, // NEW
  hasRefreshToken, // NEW
  authError, // NEW
  isAuthenticated,
} = useAuthFetch();
```

## Token Lifecycle

### Login Flow

```
User Login
    ↓
Backend returns: { accessToken, refreshToken }
    ↓
JWT callback stores both tokens
    ↓
Session includes both tokens
    ↓
Available for use in components
```

### Automatic Refresh Flow

```
Every JWT callback triggered (session access)
    ↓
Check: Is token expiring in next 10 minutes?
    ↓
YES → Call /auth/refresh-token with refreshToken
    ↓
Backend returns: { newAccessToken, refreshToken? }
    ↓
Update JWT with new token, preserve refresh token
    ↓
Session updated with new tokens
```

### 401 Response Handling

```
API Request returns 401
    ↓
useAuthFetch detects 401
    ↓
Calls updateSession() to trigger JWT refresh
    ↓
Retries request with new token
    ↓
If successful: return response
If failed: logout user
```

## Usage Examples

### Example 1: Manual Token Refresh in Component

```typescript
"use client";
import { useTokenRefresh } from "@/hooks/use-token-refresh";

export function ImportantOperation() {
  const { refresh, getTokenStatus, isRefreshing } = useTokenRefresh();

  const handleImport = async () => {
    // Ensure fresh token before important operation
    await refresh();

    const status = getTokenStatus();
    if (status.hasBackendToken) {
      // Perform sensitive operation
    }
  };

  return (
    <button onClick={handleImport} disabled={isRefreshing}>
      Import Data
    </button>
  );
}
```

### Example 2: Check Refresh Token Status

```typescript
"use client";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export function Dashboard() {
  const { hasRefreshToken, authError } = useAuthFetch();

  if (authError === "RefreshTokenError") {
    return <p>Your session has expired. Please login again.</p>;
  }

  if (!hasRefreshToken) {
    return <p>Warning: No refresh token available. Session may be limited.</p>;
  }

  return <div>Dashboard content</div>;
}
```

### Example 3: Server-Side Token Check

```typescript
import { getSessionWithRefreshToken } from "@/helpers/tokenRefresh";

export async function ServerAction() {
  const session = await getSessionWithRefreshToken();

  if (!session?.refreshToken) {
    throw new Error("No active session with refresh token");
  }

  // Proceed with authenticated operation
}
```

## Authentication Response Format (Backend)

Your backend login/register endpoints should return:

```json
{
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## Refresh Token Endpoint (Backend)

Your backend should have an `/auth/refresh-token` endpoint:

**Request:**

```json
POST /auth/refresh-token
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..." // Optional - return new one or null
  }
}
```

## Debugging

All token operations are logged in development mode. Check browser console for:

- `[JWT]` - JWT callback operations
- `[AUTH]` - Token refresh attempts
- `[SESSION]` - Session callback operations
- `[TOKEN REFRESH]` - Manual refresh operations
- `[HOOK]` - Hook-based refresh operations
- `[TOKEN CHECK]` - Token availability checks

## Troubleshooting

### Issue: `hasRefreshToken: false` in Session

**Cause:** Backend not returning refresh token or token being lost during transfer

**Fix:**

1. Verify backend is returning `refreshToken` in login response
2. Check that credentials provider is receiving the refresh token
3. Enable development logging to see where token is lost
4. Verify session callback is properly exposing token

### Issue: 401 Errors Even After Refresh

**Cause:** Refresh token is invalid or not being sent to refresh endpoint

**Fix:**

1. Ensure `/auth/refresh-token` endpoint exists on backend
2. Verify refresh token is being stored correctly
3. Check backend logs to see if refresh endpoint is receiving token
4. Verify new access token is being returned in refresh response

### Issue: Token Refresh Loops

**Cause:** Infinite retry attempts on failed refresh

**Fix:**

- System is designed to retry max 1 time (max 2 total attempts)
- If still failing, user is logged out
- Check backend `/auth/refresh-token` endpoint logs

## Next Steps

1. **Verify Backend Endpoints:**
   - Ensure `/auth/login` returns both `accessToken` and `refreshToken`
   - Ensure `/auth/google` returns both tokens
   - Implement `/auth/refresh-token` endpoint

2. **Test Token Refresh:**
   - Monitor console logs during token expiration
   - Verify automatic refresh happens ~10 minutes before expiry
   - Test 401 handling by invalidating token manually

3. **Monitor in Production:**
   - Track refresh token errors in error logging service
   - Monitor session errors from session callback
   - Alert if `RefreshTokenError` occurs

## Configuration

Token expiration times (in authOptions.ts):

- **Access Token Duration:** 30 minutes
- **Refresh Trigger:** When 10 minutes or less until expiry
- **Session Max Age:** 24 hours

Adjust these values based on your security requirements.
