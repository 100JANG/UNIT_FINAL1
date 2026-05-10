// Notification DTO -> UI mapper.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §8.

import type { NotificationDto, NotificationItem } from '../../../types/notification';

export function mapNotificationItem(dto: NotificationDto): NotificationItem {
  return {
    id: dto.notificationId,
    type: dto.type,
    title: dto.title,
    body: dto.body,
    isRead: dto.isRead === true,
    createdAt: dto.createdAt,
  };
}
