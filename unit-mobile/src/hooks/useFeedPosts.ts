// Cursor-paginated feed hook. Plain useState/useEffect — TanStack Query is not
// installed in this project (see docs/integration/00_INTEGRATION_AUDIT.md).
// When TanStack Query is added in a later cycle, replace this with useInfiniteQuery
// and keep the same return shape so FeedScreen does not change.

import { useCallback, useEffect, useRef, useState } from 'react';

import { getPosts, type FeedScope, type FeedSort } from '../services/api/feedApi';
import type { PostSummary } from '../services/api/mappers/postMapper';
import { ApiError } from '../services/api/apiTypes';

export type FeedStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'business-rule';

export type UseFeedPostsArgs = {
  scope: FeedScope;
  sort?: FeedSort;
  limit?: number;
};

export type UseFeedPostsResult = {
  status: FeedStatus;
  posts: PostSummary[];
  error: ApiError | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
};

export function useFeedPosts({ scope, sort = 'latest', limit }: UseFeedPostsArgs): UseFeedPostsResult {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<FeedStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Token to discard responses from a stale fetch when scope/sort changes mid-flight.
  const reqIdRef = useRef(0);

  const loadFirst = useCallback(() => {
    const myReq = ++reqIdRef.current;
    setStatus('loading');
    setError(null);
    setPosts([]);
    setCursor(null);
    setHasMore(false);

    getPosts({ scope, sort, limit })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setPosts(page.items);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
        setStatus(page.items.length === 0 ? 'empty' : 'success');
      })
      .catch((e: unknown) => {
        if (reqIdRef.current !== myReq) return;
        if (e instanceof ApiError) {
          setError(e);
          setStatus(e.code === 'BUSINESS_RULE_VIOLATION' ? 'business-rule' : 'error');
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
  }, [scope, sort, limit]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || status === 'loading') return;
    setIsLoadingMore(true);
    const myReq = reqIdRef.current;
    getPosts({ scope, sort, limit, cursor })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setPosts(prev => [...prev, ...page.items]);
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
  }, [scope, sort, limit, cursor, hasMore, isLoadingMore, status]);

  return {
    status,
    posts,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refetch: loadFirst,
  };
}
