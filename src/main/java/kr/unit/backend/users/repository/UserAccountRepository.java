package kr.unit.backend.users.repository;

import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.users.domain.UserAccount;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Repository
public class UserAccountRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public UserAccountRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public Optional<AuthenticatedUser> findById(String userId) {
        return realtimeDatabaseClient.get(FirebasePath.user(userId), Map.class)
                .map(raw -> mapToAuthenticated(userId, raw));
    }

    public Optional<UserAccount> findAccount(String userId) {
        return realtimeDatabaseClient.get(FirebasePath.user(userId), Map.class)
                .map(raw -> mapToAccount(userId, raw));
    }

    public void save(UserAccount account) {
        Map<String, Object> data = new HashMap<>();
        data.put("userId", account.userId());
        data.put("email", account.email());
        data.put("displayName", account.displayName());
        data.put("schoolId", account.schoolId());
        data.put("departmentId", account.departmentId());
        data.put("studentNumber", account.studentNumber());
        data.put("studentVerificationStatus", account.studentVerificationStatus().name());
        data.put("status", account.status().name());
        data.put("createdAt", account.createdAt() == null ? null : account.createdAt().toString());
        data.put("updatedAt", account.updatedAt() == null ? null : account.updatedAt().toString());
        realtimeDatabaseClient.set(FirebasePath.user(account.userId()), data);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private AuthenticatedUser mapToAuthenticated(String userId, Map raw) {
        Map<String, Object> data = (Map<String, Object>) raw;
        String email = asString(data.get("email"));
        AuthenticatedUser.UserStatus status = parseStatus(asString(data.get("status")));
        AuthenticatedUser.StudentVerificationStatus svStatus =
                parseStudentVerification(asString(data.get("studentVerificationStatus")));
        // RTDB는 sessionExpiresAt을 모르므로 null로 둔다. AuthenticationFilter에서 token 만료시각이 채워진다.
        return new AuthenticatedUser(userId, email, status, svStatus, null);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private UserAccount mapToAccount(String userId, Map raw) {
        Map<String, Object> data = (Map<String, Object>) raw;
        return new UserAccount(
                userId,
                asString(data.get("email")),
                asString(data.get("displayName")),
                asString(data.get("schoolId")),
                asString(data.get("departmentId")),
                asString(data.get("studentNumber")),
                UserAccount.StudentVerificationStatus.valueOf(
                        defaultIfBlank(asString(data.get("studentVerificationStatus")), "RESERVED")),
                UserAccount.Status.valueOf(defaultIfBlank(asString(data.get("status")), "ACTIVE")),
                parseInstant(asString(data.get("createdAt"))),
                parseInstant(asString(data.get("updatedAt")))
        );
    }

    private static AuthenticatedUser.UserStatus parseStatus(String raw) {
        if (raw == null) {
            return AuthenticatedUser.UserStatus.ACTIVE;
        }
        try {
            return AuthenticatedUser.UserStatus.valueOf(raw);
        } catch (IllegalArgumentException ex) {
            return AuthenticatedUser.UserStatus.ACTIVE;
        }
    }

    private static AuthenticatedUser.StudentVerificationStatus parseStudentVerification(String raw) {
        if (raw == null) {
            return AuthenticatedUser.StudentVerificationStatus.RESERVED;
        }
        try {
            return AuthenticatedUser.StudentVerificationStatus.valueOf(raw);
        } catch (IllegalArgumentException ex) {
            return AuthenticatedUser.StudentVerificationStatus.RESERVED;
        }
    }

    private static String asString(Object value) {
        return value == null ? null : value.toString();
    }

    private static String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static java.time.Instant parseInstant(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return java.time.Instant.parse(raw);
        } catch (Exception ex) {
            return null;
        }
    }
}
