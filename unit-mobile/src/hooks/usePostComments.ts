// Cursor-paginated comments hook for PostDetail. Plain useState/useEffect to
// match the patterns in useFeedPosts / usePostDetail. Replace with TanStack
// Query's useInfiniteQuery in a later cycle without changing the return shape.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { getPostComments } from '../services/api/commentApi';
import type { CommentItem } from '../types/post';

export type CommentsStatus =
  | 'idle'
  | 'loading'         // first page in flight
  | 'success'         // list loaded (may be empty)
  | 'auth-required'   // AUTH_REQUIRED / AUTH_INVALID / AUTH_EXPIRED
  | 'reserved'        // FEATURE_RESERVED (defensive)
  | 'not-found'       // NOT_FOUND on the parent post
  | 'error';

export type UsePostCommentsArgs = {
  postId: string;
  limit?: number;
};

export type UsePostCommentsResult = {
  status: CommentsStatus;
  comments: CommentItem[];
  error: ApiError | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
};

export function usePostComments({ postId, limit }: UsePostCommentsArgs): UsePostCommentsResult {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<CommentsStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Discard responses from a stale fetch when postId/limit changes mid-flight.
  const reqIdRef = useRef(0);

  const loadFirst = useCallback(() => {
    const myReq = ++reqIdRef.current;
    setStatus('loading');
    setError(null);
    setComments([]);
    setCursor(null);
    setHasMore(false);

    getPostComments({ postId, limit })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setComments(page.items);
        setCursor(page.cursor);
        setHasMore(page.hasMore);
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
  }, [postId, limit]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || status !== 'success') return;
    setIsLoadingMore(true);
    const myReq = reqIdRef.current;
    getPostComments({ postId, limit, cursor })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setComments(prev => [...prev, ...page.items]);
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
  }, [postId, limit, cursor, hasMore, isLoadingMore, status]);

  return {
    status,
    comments,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refetch: loadFirst,
  };
}

function mapErrorToStatus(code: string): CommentsStatus {
  switch (code) {
    case 'AUTH_REQUIRED':
    case 'AUTH_INVALID':
    case 'AUTH_EXPIRED':
      return 'auth-required';
    case 'FEATURE_RESERVED':
      return 'reserved';
    case 'NOT_FOUND':
      return 'not-found';
    default:
      return 'error';
  }
}
