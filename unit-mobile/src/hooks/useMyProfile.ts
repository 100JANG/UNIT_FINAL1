// Profile + stats hook. Loads /v1/users/me and /v1/users/me/stats in parallel.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { getMyProfile, getMyStats } from '../services/api/userApi';
import type { MyProfile, MyStats } from '../types/user';

export type MyProfileStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'auth-required'
  | 'reserved'
  | 'error';

export type UseMyProfileResult = {
  status: MyProfileStatus;
  profile: MyProfile | null;
  stats: MyStats | null;
  error: ApiError | null;
  refetch: () => void;
};

export function useMyProfile(): UseMyProfileResult {
  const [status, setStatus] = useState<MyProfileStatus>('idle');
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [stats, setStats] = useState<MyStats | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const reqIdRef = useRef(0);

  const load = useCallback(() => {
    const myReq = ++reqIdRef.current;
    setStatus('loading');
    setError(null);

    Promise.all([getMyProfile(), getMyStats()])
      .then(([p, s]) => {
        if (reqIdRef.current !== myReq) return;
        setProfile(p);
        setStats(s);
        setStatus('success');
      })
      .catch((e: unknown) => {
        if (reqIdRef.current !== myReq) return;
        if (e instanceof ApiError) {
          setError(e);
          setStatus(mapErrorToStatus(e.code));
        } else {
          setError(
            new ApiError({
              code: 'UNKNOWN',
              message: e instanceof Error ? e.message : 'Unknown error',
              result: null,
            }),
          );
          setStatus('error');
        }
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { status, profile, stats, error, refetch: load };
}

function mapErrorToStatus(code: string): MyProfileStatus {
  switch (code) {
    case 'AUTH_REQUIRED':
    case 'AUTH_INVALID':
    case 'AUTH_EXPIRED':
      return 'auth-required';
    case 'FEATURE_RESERVED':
      return 'reserved';
    default:
      return 'error';
  }
}
