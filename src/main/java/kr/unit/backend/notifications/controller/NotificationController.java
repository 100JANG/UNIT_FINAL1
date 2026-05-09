package kr.unit.backend.notifications.controller;

import jakarta.validation.Valid;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.api.Cursor;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.notifications.dto.FcmTokenRegisterRequest;
import kr.unit.backend.notifications.dto.NotificationResponse;
import kr.unit.backend.notifications.service.NotificationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/notifications")
public class NotificationController {

    private static final int DEFAULT_LIMIT = 50;

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<CursorPageResponse<NotificationResponse>> list(
            @AuthUser AuthenticatedUser user,
            @RequestParam(required = false, defaultValue = "50") int size) {
        int limit = Math.min(Math.max(size, 1), 100);
        List<NotificationResponse> items = notificationService.listMine(user, limit + 1);
        boolean hasMore = items.size() > limit;
        if (hasMore) {
            items = items.subList(0, limit);
        }
        return ApiResponse.success(CursorPageResponse.of(items, Cursor.of(null, hasMore)));
    }

    @PatchMapping("/{notificationId}")
    public ApiResponse<Map<String, Object>> markRead(
            @AuthUser AuthenticatedUser user,
            @PathVariable String notificationId) {
        notificationService.markRead(user, notificationId);
        return ApiResponse.success(Map.of("notificationId", notificationId, "isRead", true));
    }

    @DeleteMapping("/{notificationId}")
    public ApiResponse<Map<String, Object>> delete(
            @AuthUser AuthenticatedUser user,
            @PathVariable String notificationId) {
        notificationService.delete(user, notificationId);
        return ApiResponse.success("알림이 삭제되었습니다", Map.of("notificationId", notificationId));
    }

    @PostMapping("/mark-all-read")
    public ApiResponse<Map<String, Object>> markAllRead(@AuthUser AuthenticatedUser user) {
        notificationService.markAllRead(user);
        return ApiResponse.success(Map.of("userId", user.userId()));
    }

    @PostMapping("/fcm-token")
    public ApiResponse<Map<String, Object>> registerFcmToken(
            @AuthUser AuthenticatedUser user,
            @Valid @RequestBody FcmTokenRegisterRequest request) {
        notificationService.registerFcmToken(user, request);
        return ApiResponse.success("FCM 토큰이 등록되었습니다", Map.of("deviceId", request.deviceId()));
    }
}
