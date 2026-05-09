package kr.unit.backend.users.service;

import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.users.domain.UserAccount;
import kr.unit.backend.users.dto.UserProfileResponse;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class UserProfileServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private UserProfileService service;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        UserAccountRepository repo = new UserAccountRepository(fakeDb);
        service = new UserProfileService(repo, fakeDb);
    }

    @Test
    void getMyProfile_success_masksStudentNumber() {
        Instant now = Instant.parse("2026-05-09T00:00:00Z");
        UserAccount account = new UserAccount(
                "u_a", "a@ajou.ac.kr", "이동혁",
                "ajou", "ajou_csi",
                "20201234",
                UserAccount.StudentVerificationStatus.RESERVED,
                UserAccount.Status.ACTIVE,
                now, now);
        new UserAccountRepository(fakeDb).save(account);
        fakeDb.set("/schools/ajou", Map.of("name", "아주대학교"));
        fakeDb.set("/departments/ajou_csi", Map.of("name", "융합시스템공학과"));

        Instant expiresAt = Instant.parse("2026-08-31T23:59:59Z");
        AuthenticatedUser principal = new AuthenticatedUser(
                "u_a", "a@ajou.ac.kr",
                AuthenticatedUser.UserStatus.ACTIVE,
                AuthenticatedUser.StudentVerificationStatus.RESERVED,
                expiresAt);

        UserProfileResponse resp = service.getMyProfile(principal);

        assertThat(resp.userId()).isEqualTo("u_a");
        assertThat(resp.name()).isEqualTo("이동혁");
        assertThat(resp.schoolId()).isEqualTo("ajou");
        assertThat(resp.schoolName()).isEqualTo("아주대학교");
        assertThat(resp.departmentId()).isEqualTo("ajou_csi");
        assertThat(resp.departmentName()).isEqualTo("융합시스템공학과");
        assertThat(resp.studentNumberMasked()).isEqualTo("2020****");
        assertThat(resp.enrollmentStatus()).isEqualTo("RESERVED");
        assertThat(resp.sessionExpiresAt()).isEqualTo(expiresAt);
    }

    @Test
    void getMyProfile_doesNotPromoteReservedVerification() {
        // 학생 인증은 OCR/학적부 검증이 Reserved이므로 어떤 경로로도 VERIFIED로 자동 승격되지 않는다.
        // /schools, /departments에 데이터가 없어도 마스킹/RESERVED 상태가 유지되어야 한다.
        Instant now = Instant.parse("2026-05-09T00:00:00Z");
        UserAccount account = new UserAccount(
                "u_b", "school-mail@ajou.ac.kr", "홍길동",
                "ajou", "ajou_csi",
                null,
                UserAccount.StudentVerificationStatus.RESERVED,
                UserAccount.Status.ACTIVE,
                now, now);
        new UserAccountRepository(fakeDb).save(account);

        AuthenticatedUser principal = new AuthenticatedUser(
                "u_b", "school-mail@ajou.ac.kr",
                AuthenticatedUser.UserStatus.ACTIVE,
                AuthenticatedUser.StudentVerificationStatus.RESERVED,
                null);

        UserProfileResponse resp = service.getMyProfile(principal);

        assertThat(resp.enrollmentStatus()).isEqualTo("RESERVED");
        assertThat(resp.studentNumberMasked()).isNull();
        assertThat(resp.schoolName()).isNull();
        assertThat(resp.departmentName()).isNull();
    }
}
