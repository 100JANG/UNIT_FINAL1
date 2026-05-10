// Course detail loader hook.
//
// Special status: 'review-required'.
// The backend returns 422 REVIEW_QUOTA_REQUIRED when the viewer hasn't written
// a review for this course yet. Per contract, the UI MUST route to the review
// screen rather than show a toast — the consumer screen reads this status
// and calls navigation.replace('CourseReview', { courseId }).

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { getCourseDetail } from '../services/api/courseApi';
import type { CourseDetailUi } from '../types/course';

export type CourseDetailStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'review-required'   // 422 REVIEW_QUOTA_REQUIRED — caller must route to review screen
  | 'not-found'
  | 'auth-required'
  | 'reserved'
  | 'forbidden'
  | 'error';

export type UseCourseDetailResult = {
  status: CourseDetailStatus;
  course: CourseDetailUi | null;
  error: ApiError | null;
  refetch: () => void;
};

export function useCourseDetail(courseId: string): UseCourseDetailResult {
  const [status, setStatus] = useState<CourseDetailStatus>('idle');
  const [course, setCourse] = useState<CourseDetailUi | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const reqIdRef = useRef(0);

  const load = useCallback(() => {
    const myReq = ++reqIdRef.current;
    setStatus('loading');
    setError(null);
    setCourse(null);

    getCourseDetail(courseId)
      .then(c => {
        if (reqIdRef.current !== myReq) return;
        setCourse(c);
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
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  return { status, course, error, refetch: load };
}

function mapErrorToStatus(code: string): CourseDetailStatus {
  switch (code) {
    case 'REVIEW_QUOTA_REQUIRED':
      return 'review-required';
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
