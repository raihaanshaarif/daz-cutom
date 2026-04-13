# Token Refresh Implementation Summary

## ✅ Changes Made

### 1. Enhanced authOptions.ts

**Location:** `src/helpers/authOptions.ts`

**Key Improvements:**

- ✅ Fixed JWT callback to capture refresh token on initial sign-in (removed `account` check that was preventing token storage)
- ✅ Refresh token now preserved through all token updates
- ✅ Better logging for debugging token flow
- ✅ Enhanced error handling with token preservation logic
- ✅ Added explicit warnings when refresh token is missing

### 2. New: tokenRefresh.ts

**Location:** `src/helpers/tokenRefresh.ts`

**Functions:**

- `refreshAuthToken()` - Manually trigger token refresh
- `getSessionWithRefreshToken()` - Get current session with token details
- `hasValidRefreshToken()` - Check if refresh token is available

### 3. New: useTokenRefresh Hook

**Location:** `src/hooks/use-token-refresh.ts`

**Features:**

- Manual token refresh trigger
- Token status getter
- Refresh state tracking (loading, errors)
- Ideal for client components needing explicit token control

### 4. Enhanced: useAuthFetch Hook

**Location:** `src/hooks/use-auth-fetch.ts`

**New Exports:**

- `refreshToken` - Direct access to refresh token
- `hasRefreshToken` - Boolean indicator
- `authError` - Auth error state

---

## 🚀 Quick Start

### For Manual Token Refresh in Components:

```typescript
"use client";
import { useTokenRefresh } from "@/hooks/use-token-refresh";

export function MyComponent() {
  const { refresh, getTokenStatus } = useTokenRefresh();

  const handleAction = async () => {
    await refresh(); // Manually refresh before critical operation
    const status = getTokenStatus();
    console.log("Token status:", status);
  };

  return <button onClick={handleAction}>Do Something Important</button>;
}
```

### For Simple Token Checks:

```typescript
"use client";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export function Dashboard() {
  const { hasRefreshToken, refreshToken } = useAuthFetch();
  return <div>Refresh Token Available: {hasRefreshToken}</div>;
}
```

### Server-Side Token Check:

```typescript
import { getSessionWithRefreshToken } from "@/helpers/tokenRefresh";

export async function ServerComponent() {
  const session = await getSessionWithRefreshToken();
  if (!session?.refreshToken) return <div>No session</div>;
  return <div>Session active</div>;
}
```

---

## 🔧 Required Backend Implementation

### 1. Update Login/Register Responses

Ensure your backend returns BOTH tokens:

```json
{
  "data": {
    "user": { "id": "123", "email": "user@example.com", "role": "admin" },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Endpoints to update:**

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/google`

### 2. Implement Refresh Token Endpoint

Create this if it doesn't exist:

```
POST /auth/refresh-token

Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."  // Can be same or new
  }
}
```

### 3. Validation

These responses already validate that tokens exist, so ensure:

- ✅ No null/undefined tokens
- ✅ Proper JWT format
- ✅ Tokens wrapped in `data` object
- ✅ User details complete

---

## 📊 Token Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  USER LOGIN                                                 │
│  ├─ Email & Password submitted                              │
│  └─ Backend returns: { accessToken, refreshToken }          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│  JWT CALLBACK (Initial Sign-In)                             │
│  ├─ Stores both tokens                                      │
│  ├─ Sets expiration (30 min from now)                       │
│  └─ Returns: token + accessTokenExpires                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                EVERY SESSION ACCESS
                     │
┌────────────────────▼────────────────────────────────────────┐
│  JWT CALLBACK (Token Check)                                 │
│  ├─ Is token expiring in 10 min?                           │
│  │  NO → Return token as-is (preserve refresh token)       │
│  │  YES → Refresh!                                          │
│  └─ On refresh: POST /auth/refresh-token                    │
│      └─ Returns new accessToken + refreshToken             │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│  SESSION CALLBACK                                           │
│  ├─ Attaches tokens to session                              │
│  ├─ Exposes refreshToken to components                      │
│  └─ Sets error flag if refresh failed                       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│  AVAILABLE IN COMPONENTS                                    │
│  ├─ session.backendToken (Access Token)                    │
│  ├─ session.refreshToken (Refresh Token)                   │
│  └─ session.error (Any auth errors)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing the Implementation

### Test 1: Verify Tokens Are Being Captured

1. Login to the application
2. Open browser DevTools → Console
3. Look for logs with `[JWT]`, `[SESSION]`
4. Should see: `hasRefreshToken: true`

**Expected Output:**

```
[JWT] Initial sign-in for user: a.sharif@dazbd.com
[JWT] Tokens received: {
  hasBackendToken: true,
  hasRefreshToken: true,  // ← Should be TRUE now
  ...
}
```

### Test 2: Test Automatic Token Refresh

1. Login and stay on a page for 20+ minutes
2. Open Console and watch for refresh logs
3. Should see `[AUTH] ✅ Token refreshed successfully`

### Test 3: Manual Token Refresh

In browser console:

```javascript
// Import the helper
import { refreshAuthToken } from "/src/helpers/tokenRefresh.ts";

// Manually refresh
const result = await refreshAuthToken();
console.log("Refresh result:", result);
```

### Test 4: 401 Error Handling

1. Manually invalidate the backend token (via backend)
2. Make an API request that returns 401
3. System should:
   - Detect 401
   - Attempt token refresh
   - Retry the request
   - Either succeed or logout

---

## 🐛 Debugging Checklist

### Issue: `hasRefreshToken: false`

- [ ] Check backend login endpoint returns `refreshToken`
- [ ] Verify backend response format: `{ data: { refreshToken: "..." } }`
- [ ] Enable dev logging and watch console during login
- [ ] Check refresh token is being captured in JWT callback

### Issue: Tokens Not Persisting

- [ ] Verify `credentials` provider is working
- [ ] Check that `authorize` callback returns refresh token
- [ ] Verify session callback isn't filtering out refresh token
- [ ] Check NextAuth secret is set correctly

### Issue: Token Refresh Not Triggered

- [ ] Verify `/auth/refresh-token` endpoint exists on backend
- [ ] Make API call that exceeds token age (~20+ minutes)
- [ ] Check console for `[AUTH] Backend token expiring soon` log
- [ ] Verify refresh endpoint returns proper token format

---

## 📝 Configuration Reference

**File:** `src/helpers/authOptions.ts`

```typescript
// Line ~145: Token expiration time
accessTokenExpires: Date.now() + 30 * 60 * 1000,  // 30 minutes

// Line ~155: Refresh trigger (10 minutes before expiry)
Date.now() > (token.accessTokenExpires as number) - 10 * 60 * 1000

// Line ~234: Session max age
maxAge: 24 * 60 * 60,  // 24 hours
```

**Adjust these based on your security requirements:**

- More frequent refresh = More secure but more server load
- Less frequent refresh = Less secure but better performance

---

## 🔐 Security Notes

1. **Refresh tokens are secure:**
   - Stored in HTTP-only cookies (NextAuth default)
   - Not exposed to JavaScript directly through normal means
   - Only accessible through Session API

2. **Token rotation:**
   - Implement token rotation on backend if needed
   - Return new refresh token in refresh response
   - System will use new token automatically

3. **Token expiration:**
   - Access tokens are short-lived (30 min)
   - Refresh tokens should be longer (days/weeks)
   - Implement refresh token rotation for better security

4. **Logout:**
   - Clear tokens on server when user logs out
   - NextAuth handles client-side cleanup
   - Frontend logout will invalidate tokens

---

## 📞 Support

For issues:

1. Check console logs (search for `[JWT]`, `[AUTH]`, `[SESSION]`)
2. Review response format from backend
3. Ensure `/auth/refresh-token` endpoint is implemented
4. Verify tokens are being sent/received correctly

See `TOKEN_REFRESH_GUIDE.md` for detailed usage examples.
