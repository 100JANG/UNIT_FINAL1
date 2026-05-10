// Lightweight hook that returns the current viewer's userId.
// Loads from /v1/users/me on first mount in the app and caches in module
// memory so subsequent screens don't re-fetch.
//
// This avoids dragging the full /me + /me/stats payload (handled separately
// in useMyProfile) into screens that only need userId for path-templating
// (e.g. RTDB subscription on /notifications/{userId}).

import { useEffect, useState } from 'react';

import { getMyProfile } from '../services/api/userApi';

let cachedUserId: string | null | undefined; // undefined = not yet fetched
let inFlight: Promise<string | null> | null = null;

async function loadUserId(): Promise<string | null> {
  if (cachedUserId !== undefined) return cachedUserId;
  if (inFlight) return inFlight;
  inFlight = getMyProfile()
    .then(p => {
      cachedUserId = p.userId ?? null;
      return cachedUserId;
    })
    .catch(() => {
      cachedUserId = null;
      return null;
    })
    .finally(() => {
      inFlight = null;
    }) as Promise<string | null>;
  return inFlight;
}

/** Reset the cached userId — call after explicit logout / token clear so the
 *  next mount re-fetches against the new session. */
export function resetMyUserIdCache(): void {
  cachedUserId = undefined;
  inFlight = null;
}

export function useMyUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(
    cachedUserId === undefined ? null : cachedUserId,
  );

  useEffect(() => {
    let mounted = true;
    if (cachedUserId !== undefined) {
      setUserId(cachedUserId);
      return;
    }
    void loadUserId().then(id => {
      if (mounted) setUserId(id);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return userId;
}
