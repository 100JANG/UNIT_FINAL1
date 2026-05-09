package kr.unit.backend.auth.service;

import kr.unit.backend.auth.dto.AuthSessionRequest;
import kr.unit.backend.auth.dto.AuthSessionResponse;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.FirebaseTokenVerifier;
import kr.unit.backend.common.security.JwtTokenProvider;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import kr.unit.backend.support.FixedClockProvider;
import kr.unit.backend.users.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthSessionServiceTest {

    private FakeRealtimeDatabaseClient fakeDb;
    private UserAccountRepository userAccountRepository;
    private FixedClockProvider clock;
    private JwtTokenProvider jwt;
    private AuthSessionService service;
    private FirebaseTokenVerifier verifier;
    private FirebaseCustomTokenIssuer customTokenIssuer;

    @BeforeEach
    void setUp() {
        fakeDb = new FakeRealtimeDatabaseClient();
        userAccountRepository = new UserAccountRepository(fakeDb);
        clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        jwt = new JwtTokenProvider(
                "TEST_SECRET_AT_LEAST_32_BYTES_LONG_FOR_HMAC_SHA256",
                "unit-api-test",
                3600,
                clock);
        verifier = token -> {
            if (token == null || !token.startsWith("ok:")) {
                throw new BusinessException(ErrorCode.AUTH_INVALID);
            }
            String[] parts = token.substring(3).split(":", 2);
            return new FirebaseTokenVerifier.VerifiedFirebaseToken(parts[0], parts[1], true);
        };
        customTokenIssuer = userId -> "fake-custom:" + userId;
        service = new AuthSessionService(verifier, jwt, customTokenIssuer, userAccountRepository, clock);
    }

    @Test
    void issueSession_createsAccountWithReservedVerification() {
        AuthSessionResponse response = service.issueSession(
                new AuthSessionRequest("ok:u_test:test@ajou.ac.kr"));

        assertThat(response.userId()).isEqualTo("u_test");
        assertThat(response.sessionToken()).isNotBlank();
        assertThat(response.firebaseCustomToken()).isEqualTo("fake-custom:u_test");
        assertThat(response.studentVerificationStatus()).isEqualTo("RESERVED");
        assertThat(fakeDb.get("/users/u_test", java.util.Map.class)).isPresent();
    }

    @Test
    void issueSession_rejectsInvalidFirebaseToken() {
        assertThatThrownBy(() -> service.issueSession(new AuthSessionRequest("garbage")))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.AUTH_INVALID);
    }

    @Test
    void issueSession_returnsValidJwtThatJwtTokenProviderCanParse() {
        AuthSessionResponse response = service.issueSession(
                new AuthSessionRequest("ok:u_a:a@ajou.ac.kr"));
        JwtTokenProvider.ParsedSession parsed = jwt.parse(response.sessionToken());
        assertThat(parsed.userId()).isEqualTo("u_a");
        assertThat(parsed.email()).isEqualTo("a@ajou.ac.kr");
    }
}
