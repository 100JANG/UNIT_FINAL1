// Lazy Firebase init for RTDB **read** subscriptions only.
//
// Hard guarantees:
// - This module exposes ONLY a getter for the RTDB Database instance.
//   Write helpers (set/update/push/remove) are NOT exported anywhere in the
//   codebase (see rtdbRead.ts).
// - Subscriptions are disabled by default. They activate only when:
//     EXPO_PUBLIC_ENABLE_RTDATABASE === 'true'
//     AND every required Firebase env var is set to a real value (not the
//     `.env.example` "replace-me" placeholder).
// - When disabled, `getRtdb()` returns null and consumers must short-circuit
//   to a no-op subscription.

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

const PLACEHOLDER = 'replace-me';

function hasReal(v: string | undefined): boolean {
  return typeof v === 'string' && v.length > 0 && v !== PLACEHOLDER;
}

export function isRtdbEnabled(): boolean {
  if (process.env.EXPO_PUBLIC_ENABLE_RTDATABASE !== 'true') return false;
  return (
    hasReal(process.env.EXPO_PUBLIC_FIREBASE_API_KEY) &&
    hasReal(process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL) &&
    hasReal(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID)
  );
}

let cachedApp: FirebaseApp | null | undefined; // undefined = not yet attempted
let cachedDb: Database | null | undefined;

function getApp(): FirebaseApp | null {
  if (cachedApp !== undefined) return cachedApp;
  if (!isRtdbEnabled()) {
    cachedApp = null;
    return null;
  }
  try {
    // Re-use any pre-existing app (HMR / fast refresh safety).
    const existing = getApps();
    if (existing.length > 0) {
      cachedApp = existing[0];
      return cachedApp;
    }
    cachedApp = initializeApp({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    });
    return cachedApp;
  } catch {
    cachedApp = null;
    return null;
  }
}

/** Returns the RTDB Database instance, or `null` when subscriptions are
 *  disabled / unavailable. Callers MUST handle the null branch. */
export function getRtdb(): Database | null {
  if (cachedDb !== undefined) return cachedDb;
  const app = getApp();
  if (!app) {
    cachedDb = null;
    return null;
  }
  try {
    cachedDb = getDatabase(app);
    return cachedDb;
  } catch {
    cachedDb = null;
    return null;
  }
}
