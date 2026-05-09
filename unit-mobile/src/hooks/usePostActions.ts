// Post Like / Scrap toggle hook with optimistic UI + rollback.
//
// Backend endpoints (both POST, both toggle):
//   POST /v1/posts/{postId}/like  -> { postId, liked, likes }
//   POST /v1/posts/{postId}/scrap -> { postId, scrapped, totalScraps }
//
// myActions on the GET /v1/posts/{postId} response is currently absent. The
// caller passes initialLiked / initialScrapped only if a future contract
// upgrade or another endpoint surfaces them; otherwise they default to false.
//
// Concurrency policy:
// - While a request is pending, the matching button is disabled (no enqueue).
// - Each request carries a reqId; only the most-recent reqId may write state.
// - postId change resets all state to the new initials.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import { likePost, togglePostScrap } from '../services/api/postApi';

export type ActionErrorKind =
  | 'auth-required'
  | 'not-found'
  | 'forbidden'
  | 'business-rule'
  | 'reserved'
  | 'network'
  | 'unknown';

export type ActionError = {
  kind: ActionErrorKind;
  message: string;
};

export type UsePostActionsArgs = {
  postId: string;
  initialLikeCount: number;
  initialScrapCount: number;
  initialLiked?: boolean;
  initialScrapped?: boolean;
};

export type UsePostActionsResult = {
  liked: boolean;
  scrapped: boolean;
  likeCount: number;
  scrapCount: number;
  isLikePending: boolean;
  isScrapPending: boolean;
  likeError: ActionError | null;
  scrapError: ActionError | null;
  toggleLike: () => void;
  toggleScrap: () => void;
};

export function usePostActions(args: UsePostActionsArgs): UsePostActionsResult {
  const { postId, initialLikeCount, initialScrapCount, initialLiked, initialScrapped } = args;

  const [liked, setLiked] = useState<boolean>(initialLiked ?? false);
  const [scrapped, setScrapped] = useState<boolean>(initialScrapped ?? false);
  const [likeCount, setLikeCount] = useState<number>(Math.max(0, initialLikeCount));
  const [scrapCount, setScrapCount] = useState<number>(Math.max(0, initialScrapCount));
  const [isLikePending, setIsLikePending] = useState(false);
  const [isScrapPending, setIsScrapPending] = useState(false);
  const [likeError, setLikeError] = useState<ActionError | null>(null);
  const [scrapError, setScrapError] = useState<ActionError | null>(null);

  // Per-action reqIds: only the latest fetch is allowed to commit state.
  const likeReqRef = useRef(0);
  const scrapReqRef = useRef(0);

  // Reset on postId change (or when the parent re-fetches and feeds new initials).
  useEffect(() => {
    setLiked(initialLiked ?? false);
    setScrapped(initialScrapped ?? false);
    setLikeCount(Math.max(0, initialLikeCount));
    setScrapCount(Math.max(0, initialScrapCount));
    setIsLikePending(false);
    setIsScrapPending(false);
    setLikeError(null);
    setScrapError(null);
    likeReqRef.current++;
    scrapReqRef.current++;
  }, [postId, initialLiked, initialScrapped, initialLikeCount, initialScrapCount]);

  const toggleLike = useCallback(() => {
    if (isLikePending) return;

    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    const nextCount = Math.max(0, prevCount + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setLikeCount(nextCount);
    setIsLikePending(true);
    setLikeError(null);

    const myReq = ++likeReqRef.current;

    likePost(postId)
      .then(res => {
        if (likeReqRef.current !== myReq) return;
        setLiked(res.liked);
        setLikeCount(Math.max(0, res.likes));
      })
      .catch((e: unknown) => {
        if (likeReqRef.current !== myReq) return;
        setLiked(prevLiked);
        setLikeCount(prevCount);
        setLikeError(toActionError(e));
      })
      .finally(() => {
        if (likeReqRef.current === myReq) setIsLikePending(false);
      });
  }, [isLikePending, liked, likeCount, postId]);

  const toggleScrap = useCallback(() => {
    if (isScrapPending) return;

    const prevScrapped = scrapped;
    const prevCount = scrapCount;
    const nextScrapped = !prevScrapped;
    const nextCount = Math.max(0, prevCount + (nextScrapped ? 1 : -1));

    setScrapped(nextScrapped);
    setScrapCount(nextCount);
    setIsScrapPending(true);
    setScrapError(null);

    const myReq = ++scrapReqRef.current;

    togglePostScrap(postId)
      .then(res => {
        if (scrapReqRef.current !== myReq) return;
        setScrapped(res.scrapped);
        setScrapCount(Math.max(0, res.totalScraps));
      })
      .catch((e: unknown) => {
        if (scrapReqRef.current !== myReq) return;
        setScrapped(prevScrapped);
        setScrapCount(prevCount);
        setScrapError(toActionError(e));
      })
      .finally(() => {
        if (scrapReqRef.current === myReq) setIsScrapPending(false);
      });
  }, [isScrapPending, scrapped, scrapCount, postId]);

  return {
    liked,
    scrapped,
    likeCount,
    scrapCount,
    isLikePending,
    isScrapPending,
    likeError,
    scrapError,
    toggleLike,
    toggleScrap,
  };
}

function toActionError(e: unknown): ActionError {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'AUTH_REQUIRED':
      case 'AUTH_INVALID':
      case 'AUTH_EXPIRED':
        return { kind: 'auth-required', message: '로그인이 필요합니다' };
      case 'NOT_FOUND':
        return { kind: 'not-found', message: '삭제되었거나 존재하지 않는 글입니다' };
      case 'FORBIDDEN':
      case 'USER_SUSPENDED':
        return { kind: 'forbidden', message: '접근할 수 없습니다' };
      case 'FEATURE_RESERVED':
        return { kind: 'reserved', message: '준비 중인 기능입니다' };
      case 'BUSINESS_RULE_VIOLATION':
        return { kind: 'business-rule', message: e.message };
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
