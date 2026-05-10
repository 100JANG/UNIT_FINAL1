// Notifications API.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §8
//
// Wired in this cycle (REST only):
//   GET   /v1/notifications?cursor=&limit=
//   PATCH /v1/notifications/{notificationId}            (mark read)
//   POST  /v1/notifications/mark-all-read
//
// NOT wired (per runbook §"Cycle 7 주의"):
//   POST  /v1/notifications/fcm-token   — FCM/Push 구현 금지
//   DELETE /v1/notifications/{id}       — 본 cycle 범위 외

import { apiClient } from './apiClient';
import type { CursorPage } from './apiTypes';
import { buildCursorQuery } from './pagination';
import { mapNotificationItem } from './mappers/notificationMapper';
import type {
  MarkAllReadResponseDto,
  MarkReadResponseDto,
  NotificationDto,
  NotificationItem,
} from '../../types/notification';

export type ListNotificationsParams = {
  cursor?: string | null;
  limit?: number;
};

export type NotificationsPage = {
  items: NotificationItem[];
  cursor: string | null;
  hasMore: boolean;
};

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<NotificationsPage> {
  const { cursor, limit } = buildCursorQuery(params);
  const dto = await apiClient.get<CursorPage<NotificationDto>>('/notifications', {
    query: { cursor, limit },
  });
  return {
    items: (dto.items ?? []).map(mapNotificationItem),
    cursor: dto.pagination?.cursor ?? null,
    hasMore: dto.pagination?.hasMore ?? false,
  };
}

export async function markNotificationRead(
  notificationId: string,
): Promise<MarkReadResponseDto> {
  return apiClient.patch<MarkReadResponseDto>(
    `/notifications/${encodeURIComponent(notificationId)}`,
  );
}

export async function markAllNotificationsRead(): Promise<MarkAllReadResponseDto> {
  return apiClient.post<MarkAllReadResponseDto>('/notifications/mark-all-read');
}
