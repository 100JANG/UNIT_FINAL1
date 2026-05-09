package kr.unit.backend.common.security;

import java.time.Instant;

public record AuthenticatedUser(
        String userId,
        String email,
        UserStatus status,
        StudentVerificationStatus studentVerificationStatus,
        Instant sessionExpiresAt
) {
    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    public boolean isStudentVerified() {
        return studentVerificationStatus == StudentVerificationStatus.VERIFIED;
    }

    public AuthenticatedUser withSessionExpiresAt(Instant expiresAt) {
        return new AuthenticatedUser(userId, email, status, studentVerificationStatus, expiresAt);
    }

    public enum UserStatus {
        ACTIVE,
        SUSPENDED,
        WITHDRAWN
    }

    /**
     * 학생 인증 상태. RESERVED는 학생증 OCR 등 실제 학적 검증 기능이 Reserved 상태이므로
     * 검증되지 않았음을 의미한다. 학교 이메일 검증으로 VERIFIED로 올리지 않는다.
     */
    public enum StudentVerificationStatus {
        RESERVED,
        VERIFIED
    }
}
