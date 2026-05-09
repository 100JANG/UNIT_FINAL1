package kr.unit.backend.support;

import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.users.domain.UserAccount;

import java.time.Instant;

public final class FixtureFactory {

    private FixtureFactory() {
    }

    public static AuthenticatedUser authenticated(String userId, String email) {
        return authenticated(userId, email, null);
    }

    public static AuthenticatedUser authenticated(String userId, String email, Instant sessionExpiresAt) {
        return new AuthenticatedUser(
                userId,
                email,
                AuthenticatedUser.UserStatus.ACTIVE,
                AuthenticatedUser.StudentVerificationStatus.RESERVED,
                sessionExpiresAt);
    }

    public static UserAccount account(String userId, String email) {
        Instant now = Instant.parse("2026-01-01T00:00:00Z");
        return new UserAccount(
                userId,
                email,
                "테스트유저",
                "ajou",
                "ajou_csi",
                null,
                UserAccount.StudentVerificationStatus.RESERVED,
                UserAccount.Status.ACTIVE,
                now,
                now);
    }
}
