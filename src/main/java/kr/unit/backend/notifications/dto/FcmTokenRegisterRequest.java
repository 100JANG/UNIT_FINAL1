package kr.unit.backend.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FcmTokenRegisterRequest(
        @NotBlank @Size(max = 100) String deviceId,
        @NotBlank @Size(max = 4096) String fcmToken
) {
}
