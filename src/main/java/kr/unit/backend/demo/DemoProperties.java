package kr.unit.backend.demo;

import org.springframework.boot.context.properties.ConfigurationProperties;

// DEMO_MODE_START
// 시연용 코드: 운영 환경에서는 비활성화되어야 한다.
// app.demo.enabled=true 일 때만 demo 패키지 빈들이 활성화된다.
// 기본값은 false 이며 프로덕션/로컬/테스트 어떤 프로파일에서도 자동 활성화되지 않는다.
@ConfigurationProperties(prefix = "app.demo")
public record DemoProperties(
        boolean enabled,
        String userId,
        String userEmail,
        String userName,
        String schoolId,
        String schoolName,
        String departmentId,
        String departmentName,
        String studentNumberMasked) {

    public DemoProperties {
        if (userId == null || userId.isBlank()) userId = "demo_user_001";
        if (userEmail == null || userEmail.isBlank()) userEmail = "demo@example.com";
        if (userName == null || userName.isBlank()) userName = "테스트 학생";
        if (schoolId == null || schoolId.isBlank()) schoolId = "test";
        if (schoolName == null || schoolName.isBlank()) schoolName = "테스트대학교";
        if (departmentId == null || departmentId.isBlank()) departmentId = "test_sw";
        if (departmentName == null || departmentName.isBlank()) departmentName = "소프트웨어학과";
        if (studentNumberMasked == null || studentNumberMasked.isBlank()) studentNumberMasked = "2024****";
    }
}
// DEMO_MODE_END
