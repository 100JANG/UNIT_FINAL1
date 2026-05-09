package kr.unit.backend.notifications.service;

import kr.unit.backend.common.api.Cursor;
import kr.unit.backend.common.api.CursorCodec;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.api.PaginationLimits;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.notifications.domain.Notification;
import kr.unit.backend.notifications.dto.FcmTokenRegisterRequest;
import kr.unit.backend.notifications.dto.NotificationResponse;
import kr.unit.backend.notifications.repository.NotificationFirebaseRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationFirebaseRepository notificationFirebaseRepository;
    private final ClockProvider clockProvider;

    public NotificationService(NotificationFirebaseRepository notificationFirebaseRepository,
                               ClockProvider clockProvider) {
        this.notificationFirebaseRepository = notificationFirebaseRepository;
        this.clockProvider = clockProvider;
    }

    /**
     * 알림 목록 조회. /notifications/{userId}의 createdAt DESC 인덱스 쿼리로 newest-first 페이징한다.
     *
     * 정책:
     *  - {@link PaginationLimits} 통일 (기본 20, 최대 50, 0 이하 → 기본 20).
     *  - cursor는 {@link CursorCodec#encode}로 발급되며 프론트는 다음 호출에 그대로 전달한다.
     *  - isRead 필터는 본 메서드에서 적용하지 않는다 (모든 알림 반환). unread-only 필터가 필요해지면
     *    별도 인덱스 노드 또는 createdAt indexed query + isRead 후처리로 추가한다 (TODO).
     */
    public CursorPageResponse<NotificationResponse> listMine(
            AuthenticatedUser user, String cursor, int requestedLimit) {
        int limit = PaginationLimits.clamp(requestedLimit);

        List<Notification> queried;
        try {
            queried = notificationFirebaseRepository.queryByUserDesc(user.userId(), cursor, limit + 1);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        boolean hasMore = queried.size() > limit;
        List<Notification> page = hasMore ? queried.subList(0, limit) : queried;

        List<NotificationResponse> items = new ArrayList<>(page.size());
        for (Notification n : page) {
            items.add(NotificationResponse.from(n));
        }

        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            Notification last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encode(last.createdAt(), last.notificationId());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    public void markRead(AuthenticatedUser user, String notificationId) {
        if (notificationFirebaseRepository.findOne(user.userId(), notificationId).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        notificationFirebaseRepository.markRead(user.userId(), notificationId);
    }

    public void markAllRead(AuthenticatedUser user) {
        notificationFirebaseRepository.markAllRead(user.userId());
    }

    public void delete(AuthenticatedUser user, String notificationId) {
        if (notificationFirebaseRepository.findOne(user.userId(), notificationId).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        notificationFirebaseRepository.delete(user.userId(), notificationId);
    }

    public void registerFcmToken(AuthenticatedUser user, FcmTokenRegisterRequest request) {
        notificationFirebaseRepository.registerFcmToken(
                user.userId(), request.deviceId(), request.fcmToken(), clockProvider.now());
    }
}
