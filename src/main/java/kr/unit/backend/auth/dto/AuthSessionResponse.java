package kr.unit.backend.auth.dto;

import java.time.Instant;

public record AuthSessionResponse(
        String userId,
        String sessionToken,
        String firebaseCustomToken,
        Instant expiresAt,
        String studentVerificationStatus
) {
}
