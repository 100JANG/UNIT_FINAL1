package kr.unit.backend.notifications.dto;

import kr.unit.backend.notifications.domain.Notification;

import java.time.Instant;

public record NotificationResponse(
        String notificationId,
        String type,
        String title,
        String body,
        boolean isRead,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.notificationId(),
                n.type().name(),
                n.title(),
                n.body(),
                n.isRead(),
                n.createdAt());
    }
}
