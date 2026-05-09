// In-memory sessionToken holder.
//
// The frontend has no auth store yet. To avoid pulling in AsyncStorage / SecureStore
// in this connection cycle, sessionToken lives in module-level memory and is read by
// the request interceptor. Future work: persist via expo-secure-store after auth flow
// is wired (see docs/integration/02_REMAINING_CONNECTION_PLAN.md).
//
// For local manual testing, call `setSessionToken("Bearer-able JWT")` from a debug
// screen or temporarily in App.tsx.

let sessionToken: string | null = null;

export function getSessionToken(): string | null {
  return sessionToken;
}

export function setSessionToken(token: string | null): void {
  sessionToken = token;
}
