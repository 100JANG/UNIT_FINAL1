package kr.unit.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class UnitBackendApplicationTests {

    @Test
    void contextLoads() {
        // Spring 컨텍스트가 정상적으로 부트되는지 검증한다.
        // unit.firebase.enabled=false 환경에서 InMemoryRealtimeDatabaseClient + StubFirebaseTokenVerifier
        // + StubFirebaseCustomTokenIssuer fallback이 활성화되어야 한다.
    }
}
