// Per-comment Like / Delete actions.
//
// Endpoints (both auth-required):
//   POST   /v1/posts/{postId}/comments/{commentId}/like   -> toggle (idempotent body, response carries new liked + totalLikes)
//   DELETE /v1/posts/{postId}/comments/{commentId}        -> soft delete (idempotent on re-call)
//
// State model:
// - The comments list is owned by usePostComments. This hook never duplicates
//   it; instead, the caller passes `patchCommentLocally` so optimistic updates
//   and server confirmations write through to the single source of truth.
// - Per-comment pending / error state is held here in keyed Maps. The list
//   itself never carries pending UI state — that keeps mappers and DTOs clean.
//
// Concurrency:
// - Each comment has its own reqId counter. While a like toggle is in flight
//   for comment X, additional clicks on X are ignored (no enqueue).
// - postId change resets all per-comment state (different list).
//
// Notes on suppressed delete UI:
// - Backend GET /comments does not return `isMyComment`. Without that signal
//   we cannot decide who can delete. Per the cycle 3 runbook spec, we adopt
//   the SAFE option: the delete API/hook is wired but no UI button is exposed.
//   When `isMyComment` becomes available (contract addition or `/users/me`
//   join), the UI button can be added without changing this hook.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { deleteComment, likeComment } from '../services/api/commentApi';
import type { CommentItem } from '../types/post';

export type CommentActionErrorKind =
  | 'auth-required'
  | 'not-found'
  | 'forbidden'
  | 'reserved'
  | 'network'
  | 'unknown';

export type CommentActionError = {
  kind: CommentActionErrorKind;
  message: string;
};

export type UseCommentActionsArgs = {
  postId: string;
  /** Provided by usePostComments. Used to write optimistic + confirmed state. */
  patchCommentLocally: (commentId: string, patch: Partial<CommentItem>) => void;
};

export type UseCommentActionsResult = {
  isLikePending: (commentId: string) => boolean;
  isDeletePending: (commentId: string) => boolean;
  likeError: (commentId: string) => CommentActionError | null;
  deleteError: (commentId: string) => CommentActionError | null;
  /** Optimistically toggles like + count, then confirms with server response
   *  or rolls back on error. `comment` is the current comment item used to
   *  derive the previous state (likedByMe, likeCount). */
  toggleCommentLike: (comment: CommentItem) => void;
  /** Soft-delete. UI button currently suppressed; exposed for future wiring. */
  removeComment: (commentId: string) => void;
};

export function useCommentActions(
  args: UseCommentActionsArgs,
): UseCommentActionsResult {
  const { postId, patchCommentLocally } = args;

  const [likePending, setLikePending] = useState<Record<string, boolean>>({});
  const [deletePending, setDeletePending] = useState<Record<string, boolean>>({});
  const [likeErrors, setLikeErrors] = useState<Record<string, CommentActionError>>({});
  const [deleteErrors, setDeleteErrors] = useState<Record<string, CommentActionError>>({});

  // Per-(commentId, action) reqId. Only the most-recent reqId may commit state.
  const likeReqRef = useRef<Record<string, number>>({});
  const deleteReqRef = useRef<Record<string, number>>({});

  // Reset all per-comment state when navigating between posts.
  useEffect(() => {
    setLikePending({});
    setDeletePending({});
    setLikeErrors({});
    setDeleteErrors({});
    likeReqRef.current = {};
    deleteReqRef.current = {};
  }, [postId]);

  const toggleCommentLike = useCallback(
    (comment: CommentItem) => {
      const id = comment.id;
      if (likePending[id]) return;

      const prevLiked = comment.likedByMe ?? false;
      const prevCount = Math.max(0, comment.likeCount);
      const nextLiked = !prevLiked;
      const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

      patchCommentLocally(id, { likedByMe: nextLiked, likeCount: nextCount });
      setLikePending(prev => ({ ...prev, [id]: true }));
      setLikeErrors(prev => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });

      const myReq = (likeReqRef.current[id] ?? 0) + 1;
      likeReqRef.current[id] = myReq;

      likeComment(postId, id)
        .then(res => {
          if (likeReqRef.current[id] !== myReq) return;
          patchCommentLocally(id, {
            likedByMe: res.liked,
            likeCount: Math.max(0, res.totalLikes),
          });
        })
        .catch((e: unknown) => {
          if (likeReqRef.current[id] !== myReq) return;
          patchCommentLocally(id, { likedByMe: prevLiked, likeCount: prevCount });
          setLikeErrors(prev => ({ ...prev, [id]: toCommentActionError(e) }));
        })
        .finally(() => {
          if (likeReqRef.current[id] === myReq) {
            setLikePending(prev => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          }
        });
    },
    [postId, likePending, patchCommentLocally],
  );

  const removeComment = useCallback(
    (commentId: string) => {
      const id = commentId;
      if (deletePending[id]) return;

      // Optimistic soft-delete: mark deleted + replace content with the
      // localized marker the backend would set. If the request fails we roll
      // back to the previous values; on success we re-apply (idempotent).
      patchCommentLocally(id, { deleted: true, content: '삭제된 댓글입니다.' });
      setDeletePending(prev => ({ ...prev, [id]: true }));
      setDeleteErrors(prev => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });

      const myReq = (deleteReqRef.current[id] ?? 0) + 1;
      deleteReqRef.current[id] = myReq;

      // We don't have the previous content/deleted available here — caller
      // would need to pass them if a true rollback is desired. For now, on
      // failure we leave the optimistic state and surface the error so the
      // UI can prompt the user; a refetch will reconcile.
      deleteComment(postId, id)
        .then(() => {
          // success — already in the desired state.
        })
        .catch((e: unknown) => {
          if (deleteReqRef.current[id] !== myReq) return;
          setDeleteErrors(prev => ({ ...prev, [id]: toCommentActionError(e) }));
        })
        .finally(() => {
          if (deleteReqRef.current[id] === myReq) {
            setDeletePending(prev => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          }
        });
    },
    [postId, deletePending, patchCommentLocally],
  );

  return {
    isLikePending: (commentId: string) => Boolean(likePending[commentId]),
    isDeletePending: (commentId: string) => Boolean(deletePending[commentId]),
    likeError: (commentId: string) => likeErrors[commentId] ?? null,
    deleteError: (commentId: string) => deleteErrors[commentId] ?? null,
    toggleCommentLike,
    removeComment,
  };
}

function toCommentActionError(e: unknown): CommentActionError {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'AUTH_REQUIRED':
      case 'AUTH_INVALID':
      case 'AUTH_EXPIRED':
        return { kind: 'auth-required', message: '로그인이 필요합니다' };
      case 'NOT_FOUND':
        return { kind: 'not-found', message: '이미 삭제된 댓글이거나 존재하지 않습니다' };
      case 'FORBIDDEN':
      case 'USER_SUSPENDED':
        return { kind: 'forbidden', message: '권한이 없습니다' };
      case 'FEATURE_RESERVED':
        return { kind: 'reserved', message: '준비 중인 기능입니다' };
      case 'NETWORK_ERROR':
        return { kind: 'network', message: '네트워크 연결을 확인해주세요' };
      default:
        return { kind: 'unknown', message: e.message || '요청을 처리하지 못했습니다' };
    }
  }
  return {
    kind: 'unknown',
    message: e instanceof Error ? e.message : '요청을 처리하지 못했습니다',
  };
}
