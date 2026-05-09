package kr.unit.backend.notifications.domain;

import java.time.Instant;

public record Notification(
        String notificationId,
        String userId,
        NotificationType type,
        String title,
        String body,
        boolean isRead,
        Instant createdAt
) {
}
