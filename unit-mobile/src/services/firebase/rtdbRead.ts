// RTDB read-only subscriptions.
//
// IMPORTANT — write helpers (set/update/push/remove) are intentionally NOT
// imported or re-exported anywhere in this codebase. The frontend's only
// authorized writes go through Spring Boot REST endpoints. If a future cycle
// needs to expose a write surface, that's a contract-level change requiring
// runbook approval.

import { off, onValue, ref, type DataSnapshot, type Unsubscribe } from 'firebase/database';

import { getRtdb } from './firebaseClient';

export type RtdbSubscriber<T> = (value: T | null) => void;

/**
 * Subscribe to the value at `path`. The callback fires once with the current
 * value, then again every time it changes. Returns an unsubscribe function.
 *
 * When RTDB is disabled or unavailable (env not configured, or
 * EXPO_PUBLIC_ENABLE_RTDATABASE !== 'true'), this is a no-op: the callback
 * fires once with `null` and the returned function is a no-op.
 */
export function subscribeRtdbValue<T>(
  path: string,
  onChange: RtdbSubscriber<T>,
): Unsubscribe {
  const db = getRtdb();
  if (!db) {
    // Defer the null callback so consumers can treat sync vs. async paths
    // identically (subscribe -> later receive value).
    queueMicrotask(() => onChange(null));
    return () => {};
  }

  const node = ref(db, path);
  const handler = (snapshot: DataSnapshot) => {
    onChange(snapshot.val() as T | null);
  };
  onValue(node, handler, () => {
    // Permission denied / network errors are surfaced to the consumer as null
    // so the UI can fall back to its REST source of truth.
    onChange(null);
  });

  return () => {
    off(node, 'value', handler);
  };
}
