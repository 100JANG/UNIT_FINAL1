package kr.unit.backend.notifications.repository;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.QueryEntry;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.notifications.domain.Notification;
import kr.unit.backend.notifications.domain.NotificationType;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
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

    /**
     * /notifications/{userId}를 createdAt DESC 인덱스로 페이지 조회한다. 호출 측은 hasMore 판정을 위해
     * limitPlusOne을 넘기는 패턴을 쓴다. cursor는 {@link kr.unit.backend.common.api.CursorCodec#encode} 형식.
     *
     * 운영 RTDB에서는 /notifications/{userId} 노드에 .indexOn: ["createdAt", "isRead"] 필요.
     */
    public List<Notification> queryByUserDesc(String userId, String cursor, int limitPlusOne) {
        List<QueryEntry<Map>> entries = realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.userNotificationsRoot(userId), "createdAt", cursor, limitPlusOne, Map.class);
        List<Notification> result = new ArrayList<>(entries.size());
        for (QueryEntry<Map> entry : entries) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) entry.value();
            if (data == null) {
                continue;
            }
            result.add(toNotification(userId, entry.key(), data));
        }
        return result;
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
