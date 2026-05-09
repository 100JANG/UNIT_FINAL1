package kr.unit.backend.notifications.repository;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.notifications.domain.Notification;
import kr.unit.backend.notifications.domain.NotificationType;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class NotificationFirebaseRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public NotificationFirebaseRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public List<Notification> findByUser(String userId, int limit) {
        Optional<Map> rawOpt = realtimeDatabaseClient.get(FirebasePath.userNotificationsRoot(userId), Map.class);
        if (rawOpt.isEmpty()) {
            return List.of();
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> raw = (Map<String, Object>) rawOpt.get();
        List<Notification> result = new ArrayList<>();
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            if (!(entry.getValue() instanceof Map<?, ?> data)) {
                continue;
            }
            result.add(toNotification(userId, entry.getKey(), data));
        }
        result.sort(Comparator.comparing(Notification::createdAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return result.size() > limit ? result.subList(0, limit) : result;
    }

    public Optional<Notification> findOne(String userId, String notificationId) {
        return realtimeDatabaseClient.get(FirebasePath.notification(userId, notificationId), Map.class)
                .map(raw -> toNotification(userId, notificationId, raw));
    }

    public void markRead(String userId, String notificationId) {
        Map<String, Object> updates = new HashMap<>();
        updates.put(FirebasePath.notification(userId, notificationId) + "/isRead", true);
        realtimeDatabaseClient.update(updates);
    }

    public void markAllRead(String userId) {
        Optional<Map> rawOpt = realtimeDatabaseClient.get(FirebasePath.userNotificationsRoot(userId), Map.class);
        if (rawOpt.isEmpty()) {
            return;
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> raw = (Map<String, Object>) rawOpt.get();
        Map<String, Object> updates = new HashMap<>();
        for (String notificationId : raw.keySet()) {
            updates.put(FirebasePath.notification(userId, notificationId) + "/isRead", true);
        }
        if (!updates.isEmpty()) {
            realtimeDatabaseClient.update(updates);
        }
    }

    public void delete(String userId, String notificationId) {
        realtimeDatabaseClient.delete(FirebasePath.notification(userId, notificationId));
    }

    public void registerFcmToken(String userId, String deviceId, String token, Instant updatedAt) {
        Map<String, Object> data = Map.of(
                "deviceId", deviceId,
                "token", token,
                "updatedAt", updatedAt.toString());
        realtimeDatabaseClient.set(FirebasePath.fcmToken(userId, deviceId), data);
    }

    private static Notification toNotification(String userId, String id, Map<?, ?> data) {
        return new Notification(
                id,
                userId,
                parseType(str(data.get("type"))),
                str(data.get("title")),
                str(data.get("body")),
                Boolean.TRUE.equals(data.get("isRead")),
                parseInstant(str(data.get("createdAt"))));
    }

    private static NotificationType parseType(String raw) {
        if (raw == null) {
            return NotificationType.SYSTEM;
        }
        try {
            return NotificationType.valueOf(raw);
        } catch (IllegalArgumentException ex) {
            return NotificationType.SYSTEM;
        }
    }

    private static String str(Object v) {
        return v == null ? null : v.toString();
    }

    private static Instant parseInstant(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(raw);
        } catch (Exception ex) {
            return null;
        }
    }
}
