// Cursor-paginated courses list hook. Mirrors the useFeedPosts / usePostComments
// patterns: plain useState/useEffect, reqId race guard, single hook return shape
// so a future TanStack Query swap doesn't ripple to consumers.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { getCourses } from '../services/api/courseApi';
import type { CourseSummary } from '../types/course';

export type CoursesStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'auth-required'
  | 'reserved'
  | 'business-rule'
  | 'error';

export type UseCoursesArgs = {
  /** Required by backend; missing schoolId yields an empty page. */
  schoolId?: string;
  q?: string;
  semester?: string;
  limit?: number;
};

export type UseCoursesResult = {
  status: CoursesStatus;
  courses: CourseSummary[];
  error: ApiError | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
};

export function useCourses(args: UseCoursesArgs): UseCoursesResult {
  const { schoolId, q, semester, limit } = args;

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<CoursesStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const reqIdRef = useRef(0);

  const loadFirst = useCallback(() => {
    const myReq = ++reqIdRef.current;
    setStatus('loading');
    setError(null);
    setCourses([]);
    setCursor(null);
    setHasMore(false);

    getCourses({ schoolId, q, semester, limit })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setCourses(page.items);
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
  }, [schoolId, q, semester, limit]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || status !== 'success') return;
    setIsLoadingMore(true);
    const myReq = reqIdRef.current;
    getCourses({ schoolId, q, semester, limit, cursor })
      .then(page => {
        if (reqIdRef.current !== myReq) return;
        setCourses(prev => [...prev, ...page.items]);
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
  }, [schoolId, q, semester, limit, cursor, hasMore, isLoadingMore, status]);

  return {
    status,
    courses,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refetch: loadFirst,
  };
}

function mapErrorToStatus(code: string): CoursesStatus {
  switch (code) {
    case 'AUTH_REQUIRED':
    case 'AUTH_INVALID':
    case 'AUTH_EXPIRED':
      return 'auth-required';
    case 'FEATURE_RESERVED':
      return 'reserved';
    case 'BUSINESS_RULE_VIOLATION':
      return 'business-rule';
    default:
      return 'error';
  }
}
