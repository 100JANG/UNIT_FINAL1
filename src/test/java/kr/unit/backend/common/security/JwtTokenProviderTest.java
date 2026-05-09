package kr.unit.backend.common.security;

import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.support.FixedClockProvider;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    private static final String SECRET = "TEST_SECRET_AT_LEAST_32_BYTES_LONG_FOR_HMAC_SHA256";
    private static final String ISSUER = "unit-api-test";

    @Test
    void issueAndParseRoundTrip() {
        FixedClockProvider clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, ISSUER, 3600L, clock);
        JwtTokenProvider.IssuedSessionToken issued = provider.issue("u_1", "u@ajou.ac.kr");

        JwtTokenProvider.ParsedSession parsed = provider.parse(issued.token());
        assertThat(parsed.userId()).isEqualTo("u_1");
        assertThat(parsed.email()).isEqualTo("u@ajou.ac.kr");
    }

    @Test
    void expiredTokenIsRejectedWithAuthExpired() {
        FixedClockProvider issueClock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        FixedClockProvider laterClock = FixedClockProvider.at("2026-05-10T00:00:00Z");
        JwtTokenProvider issuer = new JwtTokenProvider(SECRET, ISSUER, 60L, issueClock);
        JwtTokenProvider.IssuedSessionToken issued = issuer.issue("u_1", "u@ajou.ac.kr");

        JwtTokenProvider parser = new JwtTokenProvider(SECRET, ISSUER, 60L, laterClock);
        assertThatThrownBy(() -> parser.parse(issued.token()))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.AUTH_EXPIRED);
    }

    @Test
    void invalidTokenIsRejectedWithAuthInvalid() {
        FixedClockProvider clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        JwtTokenProvider provider = new JwtTokenProvider(SECRET, ISSUER, 3600L, clock);

        assertThatThrownBy(() -> provider.parse("not-a-jwt"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).errorCode())
                .isEqualTo(ErrorCode.AUTH_INVALID);
    }

    @Test
    void shortSecretIsRejected() {
        FixedClockProvider clock = FixedClockProvider.at("2026-05-09T00:00:00Z");
        assertThatThrownBy(() -> new JwtTokenProvider("short", ISSUER, 3600L, clock))
                .isInstanceOf(IllegalStateException.class);
    }
}
