// Post-detail loader hook. Plain useState/useEffect — TanStack Query is not
// installed in this project. When it's added, swap the implementation but keep
// the return shape so PostDetailScreen does not change.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { getPostDetail } from '../services/api/postApi';
import type { PostDetail } from '../types/post';

export type PostDetailStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'not-found'
  | 'auth-required'   // AUTH_REQUIRED / AUTH_INVALID / AUTH_EXPIRED
  | 'reserved'        // FEATURE_RESERVED (defensive — POST detail isn't reserved, but contract may evolve)
  | 'forbidden'       // FORBIDDEN / USER_SUSPENDED
  | 'error';

export type UsePostDetailResult = {
  status: PostDetailStatus;
  post: PostDetail | null;
  error: ApiError | null;
  refetch: () => void;
};

export function usePostDetail(postId: string): UsePostDetailResult {
  const [status, setStatus] = useState<PostDetailStatus>('idle');
  const [post, setPost] = useState<PostDetail | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  // Discard responses from a stale fetch when postId changes mid-flight.
  const reqIdRef = useRef(0);

  const load = useCallback(() => {
    const myReq = ++reqIdRef.current;
    setStatus('loading');
    setError(null);
    setPost(null);

    getPostDetail(postId)
      .then(p => {
        if (reqIdRef.current !== myReq) return;
        setPost(p);
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
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  return { status, post, error, refetch: load };
}

function mapErrorToStatus(code: string): PostDetailStatus {
  switch (code) {
    case 'NOT_FOUND':
      return 'not-found';
    case 'AUTH_REQUIRED':
    case 'AUTH_INVALID':
    case 'AUTH_EXPIRED':
      return 'auth-required';
    case 'FEATURE_RESERVED':
      return 'reserved';
    case 'FORBIDDEN':
    case 'USER_SUSPENDED':
      return 'forbidden';
    default:
      return 'error';
  }
}
