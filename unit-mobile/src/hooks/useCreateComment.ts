// Comment-write hook for PostDetail.
//
// Endpoint: POST /v1/posts/{postId}/comments
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §6
//
// The response payload is minimal (no content / anonymousId / likes), so the
// screen-level pattern is: on success, clear the draft + ask the GET hook to
// refetch the list. This hook itself does not own the list state.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, type ValidationFieldError } from '../services/api/apiTypes';
import { createPostComment } from '../services/api/commentApi';
import type { CreateCommentResponseDto } from '../types/post';

const MAX_CONTENT_LENGTH = 1000;

export type CreateCommentErrorKind =
  | 'auth-required'
  | 'validation'
  | 'business-rule'
  | 'not-found'
  | 'forbidden'
  | 'reserved'
  | 'network'
  | 'unknown';

export type CreateCommentError = {
  kind: CreateCommentErrorKind;
  message: string;
  fieldErrors?: ValidationFieldError[];
};

export type UseCreateCommentArgs = {
  postId: string;
  onSuccess?: (created: CreateCommentResponseDto) => void;
  onError?: (err: CreateCommentError) => void;
};

export type UseCreateCommentResult = {
  content: string;
  setContent: (next: string) => void;
  parentCommentId: string | null;
  setParentCommentId: (next: string | null) => void;
  isSubmitting: boolean;
  error: CreateCommentError | null;
  /** True when the current draft satisfies length constraints and isn't empty. */
  canSubmit: boolean;
  submitComment: () => void;
  clearDraft: () => void;
  readonly maxLength: number;
};

export function useCreateComment(args: UseCreateCommentArgs): UseCreateCommentResult {
  const { postId } = args;

  const [content, setContent] = useState('');
  const [parentCommentId, setParentCommentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<CreateCommentError | null>(null);

  // Always read the latest callbacks without re-creating submitComment.
  const onSuccessRef = useRef(args.onSuccess);
  const onErrorRef = useRef(args.onError);
  useEffect(() => {
    onSuccessRef.current = args.onSuccess;
    onErrorRef.current = args.onError;
  });

  // Reset draft when the user navigates between different posts.
  useEffect(() => {
    setContent('');
    setParentCommentId(null);
    setIsSubmitting(false);
    setError(null);
  }, [postId]);

  const trimmedLen = content.trim().length;
  const canSubmit =
    !isSubmitting && trimmedLen > 0 && content.length <= MAX_CONTENT_LENGTH;

  const submitComment = useCallback(() => {
    if (isSubmitting) return;

    const trimmed = content.trim();
    if (trimmed.length === 0) return;

    if (content.length > MAX_CONTENT_LENGTH) {
      setError({
        kind: 'validation',
        message: `댓글은 최대 ${MAX_CONTENT_LENGTH}자까지 입력할 수 있습니다`,
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    createPostComment({ postId, content: trimmed, parentCommentId })
      .then(res => {
        setContent('');
        setParentCommentId(null);
        onSuccessRef.current?.(res);
      })
      .catch((e: unknown) => {
        const next = toCreateCommentError(e);
        setError(next);
        onErrorRef.current?.(next);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [postId, content, parentCommentId, isSubmitting]);

  const clearDraft = useCallback(() => {
    setContent('');
    setParentCommentId(null);
    setError(null);
  }, []);

  return {
    content,
    setContent,
    parentCommentId,
    setParentCommentId,
    isSubmitting,
    error,
    canSubmit,
    submitComment,
    clearDraft,
    maxLength: MAX_CONTENT_LENGTH,
  };
}

function toCreateCommentError(e: unknown): CreateCommentError {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'AUTH_REQUIRED':
      case 'AUTH_INVALID':
      case 'AUTH_EXPIRED':
        return { kind: 'auth-required', message: '댓글을 작성하려면 로그인이 필요합니다' };
      case 'VALIDATION_FAILED':
        return {
          kind: 'validation',
          message: e.message || '입력값을 확인해주세요',
          fieldErrors: e.validationFields ?? undefined,
        };
      case 'BUSINESS_RULE_VIOLATION':
        return { kind: 'business-rule', message: e.message };
      case 'NOT_FOUND':
        return { kind: 'not-found', message: '삭제되었거나 존재하지 않는 글입니다' };
      case 'FORBIDDEN':
      case 'USER_SUSPENDED':
        return { kind: 'forbidden', message: '댓글을 작성할 권한이 없습니다' };
      case 'FEATURE_RESERVED':
        return { kind: 'reserved', message: '준비 중인 기능입니다' };
      case 'NETWORK_ERROR':
        return { kind: 'network', message: '네트워크 연결을 확인해주세요' };
      default:
        return { kind: 'unknown', message: e.message || '댓글을 등록하지 못했습니다' };
    }
  }
  return {
    kind: 'unknown',
    message: e instanceof Error ? e.message : '댓글을 등록하지 못했습니다',
  };
}
