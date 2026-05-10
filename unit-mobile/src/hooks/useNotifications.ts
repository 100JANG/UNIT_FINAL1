// Notifications hook: cursor-paginated list + per-notification markRead +
// markAllRead. Optimistic updates for read flags; on failure we re-fetch the
// list (instead of trying to roll back individual flags) so the UI converges
// to backend state.

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../services/api/apiTypes';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/api/notificationApi';
import type { NotificationItem } from '../types/notification';

export type NotificationsStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'auth-required'
  | 'reserved'
  | 'error';

export type UseNotificationsResult = {
  status: NotificationsStatus;
  items: NotificationItem[];
  error: ApiError | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  unreadCount: number;
  loadMore: () => void;
  refetch: () => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
};

export function useNotifications(limit?: number): UseNotificationsResult {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<NotificationsStatus>('idle');
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

    listNotifications({ limit })
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
  }, [limit]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || status !== 'success') return;
    setIsLoadingMore(true);
    const myReq = reqIdRef.current;
    listNotifications({ limit, cursor })
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
  }, [limit, cursor, hasMore, isLoadingMore, status]);

  const markRead = useCallback(
    (notificationId: string) => {
      // Skip if already read (avoid noise; backend is idempotent but no need).
      const target = items.find(n => n.id === notificationId);
      if (!target || target.isRead) return;

      // Optimistic.
      setItems(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );

      markNotificationRead(notificationId).catch(() => {
        // Re-fetch on failure so the UI re-aligns with backend truth.
        loadFirst();
      });
    },
    [items, loadFirst],
  );

  const markAllRead = useCallback(() => {
    if (items.every(n => n.isRead)) return;

    // Optimistic: flip all to read.
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));

    markAllNotificationsRead().catch(() => {
      loadFirst();
    });
  }, [items, loadFirst]);

  const unreadCount = items.reduce((acc, n) => (n.isRead ? acc : acc + 1), 0);

  return {
    status,
    items,
    error,
    hasMore,
    isLoadingMore,
    unreadCount,
    loadMore,
    refetch: loadFirst,
    markRead,
    markAllRead,
  };
}

function mapErrorToStatus(code: string): NotificationsStatus {
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
