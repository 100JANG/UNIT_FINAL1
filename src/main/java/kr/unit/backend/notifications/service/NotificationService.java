package kr.unit.backend.notifications.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.notifications.dto.FcmTokenRegisterRequest;
import kr.unit.backend.notifications.dto.NotificationResponse;
import kr.unit.backend.notifications.repository.NotificationFirebaseRepository;
import org.springframework.stereotype.Service;

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

    public List<NotificationResponse> listMine(AuthenticatedUser user, int limit) {
        return notificationFirebaseRepository.findByUser(user.userId(), limit).stream()
                .map(NotificationResponse::from)
                .toList();
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
