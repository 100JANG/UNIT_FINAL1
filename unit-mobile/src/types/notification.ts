// Notification DTOs and UI shapes.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §8.

export type NotificationType =
  | 'JURY_SUMMON'
  | 'POST_COMMENT'
  | 'POST_LIKE'
  | 'RECAP_READY'
  | 'REPORT_RESULT'
  | 'SYSTEM';

export type NotificationDto = {
  notificationId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type MarkReadResponseDto = {
  notificationId: string;
  isRead: boolean;
};

export type MarkAllReadResponseDto = {
  userId: string;
};
