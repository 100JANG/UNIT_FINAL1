package kr.unit.backend.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

// DEMO_MODE_START
// 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
// app.demo.enabled=true 일 때 DemoAuthController + DemoDataSeeder + DemoProperties 빈이
// 정상 등록되는지 컨텍스트 부팅으로 확인한다. ApplicationRunner 로 등록한 seeder 가
// 부팅 직후 시연 데이터를 채워주어 DemoAuthController.demoLogin() 호출이 가능해진다.
@SpringBootTest(properties = "app.demo.enabled=true")
@ActiveProfiles("test")
class DemoModeEnabledContextTest {

    @Autowired
    ApplicationContext context;

    @Autowired
    DemoAuthController demoAuthController;

    @Autowired
    DemoProperties demoProperties;

    @Test
    void demoBeans_areRegistered() {
        assertThat(demoAuthController).isNotNull();
        assertThat(demoProperties.enabled()).isTrue();
        assertThat(demoProperties.userId()).isEqualTo("demo_user_001");
        assertThat(demoProperties.schoolId()).isEqualTo("test");
        assertThat(demoProperties.departmentId()).isEqualTo("test_sw");
        assertThat(context.getBean(DemoAuthController.class)).isSameAs(demoAuthController);
    }

    @Test
    void demoLogin_succeedsAfterSeederHasRun() {
        // ApplicationRunner 가 부팅 직후 호출되었으므로 demo user 가 RTDB 에 존재한다.
        var response = demoAuthController.demoLogin();
        assertThat(response.code()).isEqualTo("SUCCESS");
        assertThat(response.result()).containsKey("sessionToken");

        @SuppressWarnings("unchecked")
        var user = (java.util.Map<String, Object>) response.result().get("user");
        assertThat(user.get("userId")).isEqualTo("demo_user_001");
        assertThat(user.get("studentVerificationStatus")).isEqualTo("RESERVED");
    }
}
// DEMO_MODE_END
