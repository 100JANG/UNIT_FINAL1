package kr.unit.backend.demo;

import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.security.JwtTokenProvider;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DemoAuthControllerTest {

    private DemoAuthController controller;
    private DemoProperties props;
    private UserAccountRepository userRepo;
    private FakeRealtimeDatabaseClient db;
    private JwtTokenProvider jwt;

    @BeforeEach
    void setUp() {
        db = new FakeRealtimeDatabaseClient();
        userRepo = new UserAccountRepository(db);
        FixedClockProvider clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        jwt = new JwtTokenProvider(
                "TEST_SECRET_AT_LEAST_32_BYTES_LONG_FOR_HMAC_SHA256",
                "unit-api-test",
                3600,
                clock);
        props = new DemoProperties(true, null, null, null, null, null, null, null, null);

        // Seed first so the controller can find the demo account.
        DemoDataSeeder.seed(props, db, userRepo, clock);

        controller = new DemoAuthController(props, jwt, userRepo);
    }

    @Test
    void demoLogin_returnsSessionTokenForReservedDemoUser() {
        ApiResponse<Map<String, Object>> response = controller.demoLogin();

        assertThat(response.code()).isEqualTo("SUCCESS");
        Map<String, Object> result = response.result();
        assertThat(result).containsKey("sessionToken");
        assertThat((String) result.get("sessionToken")).isNotBlank();

        @SuppressWarnings("unchecked")
        Map<String, Object> user = (Map<String, Object>) result.get("user");
        assertThat(user.get("userId")).isEqualTo("demo_user_001");
        assertThat(user.get("schoolId")).isEqualTo("test");
        assertThat(user.get("departmentId")).isEqualTo("test_sw");
        assertThat(user.get("schoolName")).isEqualTo("테스트대학교");
        assertThat(user.get("departmentName")).isEqualTo("소프트웨어학과");
        // 학생인증을 통과한 것처럼 표현 금지 — 항상 RESERVED.
        assertThat(user.get("studentVerificationStatus")).isEqualTo("RESERVED");
    }

    @Test
    void issuedToken_isParseableByTheSameJwtTokenProvider() {
        ApiResponse<Map<String, Object>> response = controller.demoLogin();
        String token = (String) response.result().get("sessionToken");

        JwtTokenProvider.ParsedSession parsed = jwt.parse(token);
        assertThat(parsed.userId()).isEqualTo("demo_user_001");
    }

    @Test
    void demoLogin_failsLoudlyWhenSeederDidNotRun() {
        // Wipe the user node to simulate seeder having not run.
        FakeRealtimeDatabaseClient empty = new FakeRealtimeDatabaseClient();
        UserAccountRepository emptyRepo = new UserAccountRepository(empty);
        DemoAuthController bad = new DemoAuthController(props, jwt, emptyRepo);

        assertThatThrownBy(bad::demoLogin)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Demo user not seeded");
    }
}
