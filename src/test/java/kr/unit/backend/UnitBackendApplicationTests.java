package kr.unit.backend;

import kr.unit.backend.demo.DemoAuthController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class UnitBackendApplicationTests {

    @Autowired
    ApplicationContext context;

    @Test
    void contextLoads() {
        // Spring 컨텍스트가 정상적으로 부트되는지 검증한다.
        // unit.firebase.enabled=false 환경에서 InMemoryRealtimeDatabaseClient + StubFirebaseTokenVerifier
        // + StubFirebaseCustomTokenIssuer fallback이 활성화되어야 한다.
    }

    // DEMO_MODE_START
    // 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
    // app.demo.enabled 속성이 켜져 있지 않으면 DemoAuthController 가 등록되어선 안 된다.
    // /v1/dev/demo-login 은 컨트롤러 빈 자체가 없어야 404 로 차단된다.
    @Test
    void demoController_isNotRegistered_whenDemoModeDisabled() {
        assertThat(context.getBeansOfType(DemoAuthController.class)).isEmpty();
    }
    // DEMO_MODE_END
}
