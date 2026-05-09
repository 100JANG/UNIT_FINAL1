// Session token storage backed by expo-secure-store.
//
// - Persists across app restarts (Keychain on iOS, EncryptedSharedPreferences on Android).
// - On web, expo-secure-store falls back to localStorage. Acceptable for dev-only Expo web.
// - In-memory cache avoids hitting native I/O on every API request.
//
// Do NOT log tokens, do NOT include them in mock data, do NOT commit them.

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'unit.sessionToken';

let cached: string | null | undefined = undefined; // `undefined` = not loaded yet

export async function getSessionToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    cached = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cached = null;
  }
  return cached;
}

export async function setSessionToken(token: string): Promise<void> {
  cached = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  cached = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore.deleteItemAsync throws if the key doesn't exist on some platforms.
    // Cache is already cleared above; swallow the error.
  }
}

export async function hasSessionToken(): Promise<boolean> {
  return (await getSessionToken()) !== null;
}
