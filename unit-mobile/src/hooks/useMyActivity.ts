// Generic cursor-paginated hook for /v1/users/me/{posts|comments|likes|scraps}.
// Each activity endpoint has a different item shape, so we parameterize on the
// fetcher function. The resulting hook is exposed as 4 thin wrappers below.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import {
  type ActivityPage,
  listMyComments,
  listMyLikes,
  listMyPosts,
  listMyScraps,
} from '../services/api/userApi';
import type {
  UserCommentActivity,
  UserLikeActivity,
  UserPostActivity,
  UserScrapActivity,
} from '../types/user';

export type ActivityStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'auth-required'
  | 'reserved'
  | 'error';

export type UseActivityResult<T> = {
  status: ActivityStatus;
  items: T[];
  error: ApiError | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
};

type Fetcher<T> = (params: {
  cursor?: string | null;
  limit?: number;
}) => Promise<ActivityPage<T>>;

function useActivityList<T>(fetcher: Fetcher<T>, limit?: number): UseActivityResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<ActivityStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const reqIdRef = useRef(0);

  const loadFirst = useCallback(() => {
    const myReq = ++reqIdRef.current;
    setStatus('loading');
    setError(null);
    setItems([]);
    setCursor(null);
    setHasMore(false);

    fetcher({ limit })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setItems(page.items);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
        setStatus(page.items.length === 0 ? 'empty' : 'success');
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
  }, [fetcher, limit]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || status !== 'success') return;
    setIsLoadingMore(true);
    const myReq = reqIdRef.current;
    fetcher({ limit, cursor })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setItems(prev => [...prev, ...page.items]);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
      })
      .catch((e: unknown) => {
        if (reqIdRef.current !== myReq) return;
        if (e instanceof ApiError) setError(e);
      })
      .finally(() => {
        if (reqIdRef.current === myReq) setIsLoadingMore(false);
      });
  }, [fetcher, limit, cursor, hasMore, isLoadingMore, status]);

  return { status, items, error, hasMore, isLoadingMore, loadMore, refetch: loadFirst };
}

function mapErrorToStatus(code: string): ActivityStatus {
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

// ---- Public hooks (one per activity endpoint) -------------------------------

export function useMyPosts(limit?: number): UseActivityResult<UserPostActivity> {
  return useActivityList(listMyPosts, limit);
}

export function useMyComments(limit?: number): UseActivityResult<UserCommentActivity> {
  return useActivityList(listMyComments, limit);
}

export function useMyLikes(limit?: number): UseActivityResult<UserLikeActivity> {
  return useActivityList(listMyLikes, limit);
}

export function useMyScraps(limit?: number): UseActivityResult<UserScrapActivity> {
  return useActivityList(listMyScraps, limit);
}
