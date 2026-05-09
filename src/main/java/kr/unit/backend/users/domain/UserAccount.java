package kr.unit.backend.users.domain;

import kr.unit.backend.common.security.AuthenticatedUser;

import java.time.Instant;

/**
 * UNIT 사용자 계정. RTDB의 /users/{userId} 노드와 1:1 대응한다.
 * studentVerificationStatus는 RESERVED로 시작하며, 학생증 OCR / 학적 검증이 Reserved 상태이므로
 * 어떤 흐름에서도 자동으로 VERIFIED로 승격되지 않는다.
 */
public record UserAccount(
        String userId,
        String email,
        String displayName,
        String schoolId,
        String departmentId,
        String studentNumber,
        StudentVerificationStatus studentVerificationStatus,
        Status status,
        Instant createdAt,
        Instant updatedAt
) {
    public AuthenticatedUser toAuthenticatedUser() {
        return new AuthenticatedUser(
                userId,
                email,
                AuthenticatedUser.UserStatus.valueOf(status.name()),
                AuthenticatedUser.StudentVerificationStatus.valueOf(studentVerificationStatus.name()),
                null);
    }

    public enum Status {
        ACTIVE,
        SUSPENDED,
        WITHDRAWN
    }

    public enum StudentVerificationStatus {
        RESERVED,
        VERIFIED
    }
}
