package kr.unit.backend.common.error;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

    // Common
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청 형식입니다"),
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "입력값 검증에 실패했습니다"),
    AUTH_REQUIRED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다"),
    AUTH_INVALID(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    AUTH_EXPIRED(HttpStatus.UNAUTHORIZED, "세션이 만료되었습니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "허용되지 않은 메서드입니다"),
    UNSUPPORTED_MEDIA_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "지원하지 않는 미디어 형식입니다"),
    BUSINESS_RULE_VIOLATION(HttpStatus.UNPROCESSABLE_ENTITY, "비즈니스 규칙에 위배됩니다"),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "요청 횟수를 초과했습니다"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다"),
    FEATURE_RESERVED(HttpStatus.NOT_IMPLEMENTED, "현재 버전에서 구현하지 않는 예약 기능입니다."),
    SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "일시적으로 사용할 수 없습니다"),

    // Auth-related (also under common)
    USER_SUSPENDED(HttpStatus.FORBIDDEN, "정지된 사용자입니다"),

    // Domain
    REVIEW_QUOTA_REQUIRED(HttpStatus.UNPROCESSABLE_ENTITY, "강의평 작성 후 열람 가능합니다"),
    JURY_NOT_AUTHORIZED(HttpStatus.UNPROCESSABLE_ENTITY, "배심원 자격이 없습니다"),
    JURY_ALREADY_VOTED(HttpStatus.UNPROCESSABLE_ENTITY, "이미 투표했습니다"),
    JURY_WINDOW_CLOSED(HttpStatus.UNPROCESSABLE_ENTITY, "응답 윈도우가 종료되었습니다"),
    REPORT_DUPLICATE(HttpStatus.UNPROCESSABLE_ENTITY, "이미 신고한 게시글입니다");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus status() {
        return status;
    }

    public String defaultMessage() {
        return defaultMessage;
    }
}
