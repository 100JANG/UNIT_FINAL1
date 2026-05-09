package kr.unit.backend.common.error;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ErrorCodeTest {

    @Test
    void requiredCommonCodesArePresent() {
        Set<String> required = Set.of(
                "INVALID_REQUEST", "VALIDATION_FAILED",
                "AUTH_REQUIRED", "AUTH_INVALID", "AUTH_EXPIRED",
                "FORBIDDEN", "NOT_FOUND", "METHOD_NOT_ALLOWED",
                "UNSUPPORTED_MEDIA_TYPE", "BUSINESS_RULE_VIOLATION",
                "RATE_LIMIT_EXCEEDED", "INTERNAL_ERROR",
                "FEATURE_RESERVED", "SERVICE_UNAVAILABLE",
                "REVIEW_QUOTA_REQUIRED",
                "JURY_NOT_AUTHORIZED", "JURY_ALREADY_VOTED", "JURY_WINDOW_CLOSED",
                "REPORT_DUPLICATE");
        for (String name : required) {
            assertThat(ErrorCode.valueOf(name)).isNotNull();
        }
    }

    @Test
    void featureReservedExistsWithCorrectStatusAndMessage() {
        ErrorCode code = ErrorCode.FEATURE_RESERVED;
        assertThat(code.status()).isEqualTo(HttpStatus.NOT_IMPLEMENTED);
        assertThat(code.defaultMessage()).isEqualTo("현재 버전에서 구현하지 않는 예약 기능입니다.");
    }

    /**
     * 다음 코드들은 docs/api/04_ERROR_CODES.md에서 "현재 사용하지 않음"으로 표시된 Reserved feature 전용 코드들이다.
     * 이번 MVP에서 emit되지 않으므로 enum에 정의되어서는 안 된다.
     * (단, 일반 Reserved 응답용 FEATURE_RESERVED는 별도로 유지된다.)
     */
    @Test
    void unusedReservedFeatureCodesAreNotDefined() {
        Set<String> banned = Set.of(
                "OCR_FAILED", "INVALID_STUDENT_CARD",
                "TOXIC_CONTENT_DETECTED", "POST_BLOCKED_FROM_FREE_BOARD",
                "AI_UNAVAILABLE");
        for (String name : banned) {
            assertThat(java.util.Arrays.stream(ErrorCode.values()).map(Enum::name))
                    .as("Reserved feature 전용 에러 코드 %s 는 ErrorCode enum에 정의되면 안 된다", name)
                    .doesNotContain(name);
        }
    }

    @Test
    void authStatusesAre401Or403() {
        assertThat(ErrorCode.AUTH_REQUIRED.status()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(ErrorCode.AUTH_INVALID.status()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(ErrorCode.AUTH_EXPIRED.status()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(ErrorCode.FORBIDDEN.status()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void domainBusinessCodesUse422() {
        assertThat(ErrorCode.REVIEW_QUOTA_REQUIRED.status()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(ErrorCode.JURY_ALREADY_VOTED.status()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
        assertThat(ErrorCode.REPORT_DUPLICATE.status()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
