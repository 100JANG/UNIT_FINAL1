package kr.unit.backend.demo;

import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.security.JwtTokenProvider;
import kr.unit.backend.users.domain.UserAccount;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// DEMO_MODE_START
// 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
//
// POST /v1/dev/demo-login 은 단 하나의 일을 한다 — Demo Seeder가 이미 심어둔
// 테스트 학생 계정(userAccountRepository에 RESERVED 상태로 존재)에 대해 sessionToken을
// 발급한다. 새로운 토큰 구조를 만들지 않고 기존 JwtTokenProvider 만 재사용한다.
//
// 이 컨트롤러는 app.demo.enabled=true 일 때만 등록된다. false 또는 미지정이면
// 빈 자체가 만들어지지 않으므로 /v1/dev/demo-login 은 404로 응답한다.
@RestController
@RequestMapping("/v1/dev")
@ConditionalOnProperty(prefix = "app.demo", name = "enabled", havingValue = "true")
public class DemoAuthController {

    private static final Logger log = LoggerFactory.getLogger(DemoAuthController.class);

    private final DemoProperties properties;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserAccountRepository userAccountRepository;

    public DemoAuthController(DemoProperties properties,
                              JwtTokenProvider jwtTokenProvider,
                              UserAccountRepository userAccountRepository) {
        this.properties = properties;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userAccountRepository = userAccountRepository;
    }

    @PostMapping("/demo-login")
    public ApiResponse<Map<String, Object>> demoLogin() {
        // Demo seeder가 사용자를 미리 심어두지만, 만약 어떤 이유로 사라졌다면
        // 시연을 막지 않기 위해 즉석에서 보강한다.
        UserAccount account = userAccountRepository.findAccount(properties.userId())
                .orElseThrow(() -> new IllegalStateException(
                        "Demo user not seeded. Did DemoDataSeeder run? userId=" + properties.userId()));

        JwtTokenProvider.IssuedSessionToken session =
                jwtTokenProvider.issue(account.userId(), account.email());

        log.info("Demo login issued: userId={} expiresAt={}", account.userId(), session.expiresAt());

        // studentVerificationStatus 는 항상 RESERVED 로 응답한다 — 시연 우회는
        // 인증을 '통과한 척' 하는 것이 아니라 인증 흐름 자체를 건너뛰는 것이다.
        Map<String, Object> user = Map.of(
                "userId", account.userId(),
                "schoolId", account.schoolId() == null ? "" : account.schoolId(),
                "schoolName", properties.schoolName(),
                "departmentId", account.departmentId() == null ? "" : account.departmentId(),
                "departmentName", properties.departmentName(),
                "studentVerificationStatus", account.studentVerificationStatus().name()
        );

        Map<String, Object> result = Map.of(
                "sessionToken", session.token(),
                "expiresAt", session.expiresAt().toString(),
                "user", user
        );

        return ApiResponse.success(result);
    }
}
// DEMO_MODE_END
