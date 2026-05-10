// React hook around subscribeRtdbValue. Auto-unsubscribes on unmount or path
// change. Returns the latest value (null when disabled / not yet received).

import { useEffect, useState } from 'react';

import { subscribeRtdbValue } from '../services/firebase/rtdbRead';

/**
 * Subscribe to the RTDB value at `path`. Pass a falsy `path` (null/undefined/'')
 * to skip subscription — useful when path depends on async data (e.g. userId).
 */
export function useRtdbValue<T>(path: string | null | undefined): T | null {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    if (!path) {
      setValue(null);
      return;
    }
    const unsubscribe = subscribeRtdbValue<T>(path, v => {
      setValue(v);
    });
    return unsubscribe;
  }, [path]);

  return value;
}
