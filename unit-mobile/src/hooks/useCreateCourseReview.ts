// Course-review submit hook.
//
// POST /v1/courses/{courseId}/reviews
// Vote: RECOMMEND | NOT_RECOMMEND | SKIP   (NotNull)
// Comment: optional, ≤ 200 chars
//
// Concurrency: in-flight clicks are ignored (no enqueue). courseId change
// resets local draft.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, type ValidationFieldError } from '../services/api/apiTypes';
import { createCourseReview } from '../services/api/courseApi';
import type { CourseReviewCreatedResponseDto, CourseReviewVote } from '../types/course';

const MAX_COMMENT_LENGTH = 200;

export type CreateCourseReviewErrorKind =
  | 'auth-required'
  | 'validation'
  | 'business-rule'      // already submitted (most common)
  | 'not-found'
  | 'forbidden'
  | 'reserved'
  | 'network'
  | 'unknown';

export type CreateCourseReviewError = {
  kind: CreateCourseReviewErrorKind;
  message: string;
  fieldErrors?: ValidationFieldError[];
};

export type UseCreateCourseReviewArgs = {
  courseId: string;
  onSuccess?: (created: CourseReviewCreatedResponseDto) => void;
  onError?: (err: CreateCourseReviewError) => void;
};

export type UseCreateCourseReviewResult = {
  vote: CourseReviewVote | null;
  setVote: (next: CourseReviewVote | null) => void;
  comment: string;
  setComment: (next: string) => void;
  isSubmitting: boolean;
  error: CreateCourseReviewError | null;
  /** True when vote != null and comment within length, and not currently submitting. */
  canSubmit: boolean;
  submitReview: () => void;
  /** Submit a SKIP vote and ignore the comment input — used by the AppBar
   *  "건너뛰기" affordance. Equivalent to setVote('SKIP') + submitReview(). */
  skipReview: () => void;
  readonly maxCommentLength: number;
};

export function useCreateCourseReview(
  args: UseCreateCourseReviewArgs,
): UseCreateCourseReviewResult {
  const { courseId } = args;

  const [vote, setVote] = useState<CourseReviewVote | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<CreateCourseReviewError | null>(null);

  const onSuccessRef = useRef(args.onSuccess);
  const onErrorRef = useRef(args.onError);
  useEffect(() => {
    onSuccessRef.current = args.onSuccess;
    onErrorRef.current = args.onError;
  });

  // Reset draft on courseId change.
  useEffect(() => {
    setVote(null);
    setComment('');
    setIsSubmitting(false);
    setError(null);
  }, [courseId]);

  const canSubmit =
    !isSubmitting && vote !== null && comment.length <= MAX_COMMENT_LENGTH;

  const submitWith = useCallback(
    (effectiveVote: CourseReviewVote, effectiveComment: string | undefined) => {
      if (isSubmitting) return;
      if (effectiveComment !== undefined && effectiveComment.length > MAX_COMMENT_LENGTH) {
        setError({
          kind: 'validation',
          message: `의견은 최대 ${MAX_COMMENT_LENGTH}자까지 입력할 수 있습니다`,
        });
        return;
      }

      setIsSubmitting(true);
      setError(null);

      createCourseReview({
        courseId,
        vote: effectiveVote,
        comment: effectiveComment,
      })
        .then(res => {
          setVote(null);
          setComment('');
          onSuccessRef.current?.(res);
        })
        .catch((e: unknown) => {
          const next = toCourseReviewError(e);
          setError(next);
          onErrorRef.current?.(next);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [courseId, isSubmitting],
  );

  const submitReview = useCallback(() => {
    if (vote === null) return;
    const trimmed = comment.trim();
    submitWith(vote, trimmed.length > 0 ? trimmed : undefined);
  }, [vote, comment, submitWith]);

  const skipReview = useCallback(() => {
    submitWith('SKIP', undefined);
  }, [submitWith]);

  return {
    vote,
    setVote,
    comment,
    setComment,
    isSubmitting,
    error,
    canSubmit,
    submitReview,
    skipReview,
    maxCommentLength: MAX_COMMENT_LENGTH,
  };
}

function toCourseReviewError(e: unknown): CreateCourseReviewError {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'AUTH_REQUIRED':
      case 'AUTH_INVALID':
      case 'AUTH_EXPIRED':
        return { kind: 'auth-required', message: '강의평을 작성하려면 로그인이 필요합니다' };
      case 'VALIDATION_FAILED':
        return {
          kind: 'validation',
          message: e.message || '입력값을 확인해주세요',
          fieldErrors: e.validationFields ?? undefined,
        };
      case 'BUSINESS_RULE_VIOLATION':
        return { kind: 'business-rule', message: e.message };
      case 'NOT_FOUND':
        return { kind: 'not-found', message: '강의를 찾을 수 없습니다' };
      case 'FORBIDDEN':
      case 'USER_SUSPENDED':
        return { kind: 'forbidden', message: '강의평을 작성할 권한이 없습니다' };
      case 'FEATURE_RESERVED':
        return { kind: 'reserved', message: '준비 중인 기능입니다' };
      case 'NETWORK_ERROR':
        return { kind: 'network', message: '네트워크 연결을 확인해주세요' };
      default:
        return { kind: 'unknown', message: e.message || '강의평을 등록하지 못했습니다' };
    }
  }
  return {
    kind: 'unknown',
    message: e instanceof Error ? e.message : '강의평을 등록하지 못했습니다',
  };
}
