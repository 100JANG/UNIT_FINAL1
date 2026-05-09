package kr.unit.backend.users.service;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.users.domain.UserAccount;
import kr.unit.backend.users.dto.UserProfileResponse;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class UserProfileService {

    private final UserAccountRepository userAccountRepository;
    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public UserProfileService(UserAccountRepository userAccountRepository,
                              RealtimeDatabaseClient realtimeDatabaseClient) {
        this.userAccountRepository = userAccountRepository;
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public UserProfileResponse getMyProfile(AuthenticatedUser principal) {
        UserAccount account = userAccountRepository.findAccount(principal.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        String schoolName = lookupName(account.schoolId() == null
                ? null : FirebasePath.school(account.schoolId()));
        String departmentName = lookupName(account.departmentId() == null
                ? null : FirebasePath.department(account.departmentId()));

        // enrollmentStatus는 OCR/학적 검증 결과(Reserved). 학교 이메일/스택 외부 검증으로 VERIFIED 승격 금지.
        String enrollmentStatus = account.studentVerificationStatus().name();

        return new UserProfileResponse(
                account.userId(),
                account.displayName(),
                account.schoolId(),
                schoolName,
                account.departmentId(),
                departmentName,
                maskStudentNumber(account.studentNumber()),
                enrollmentStatus,
                principal.sessionExpiresAt());
    }

    /**
     * 학번을 앞 4자만 노출하고 나머지를 *로 가린다 (예: 20201234 → 2020****).
     * 4자 이하는 전체를 마스킹한다. null/빈값이면 null.
     */
    static String maskStudentNumber(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.length() <= 4) {
            return "*".repeat(trimmed.length());
        }
        return trimmed.substring(0, 4) + "*".repeat(trimmed.length() - 4);
    }

    private String lookupName(String path) {
        if (path == null) {
            return null;
        }
        Optional<Map> raw = realtimeDatabaseClient.get(path, Map.class);
        if (raw.isEmpty()) {
            return null;
        }
        Object name = raw.get().get("name");
        return name == null ? null : name.toString();
    }
}
