package kr.unit.backend.common.api;

/**
 * 모든 cursor 기반 목록 API가 공유하는 limit 정책 (사용자 정합성 정리 기준).
 *
 * - 기본값 20
 * - 최대값 50
 * - 0 또는 음수가 들어오면 기본값으로 fallback
 *
 * 새로운 페이지 limit 정책을 도메인별로 따로 만들지 말고 이 클래스를 사용하라.
 */
public final class PaginationLimits {

    public static final int DEFAULT_LIMIT = 20;
    public static final int MAX_LIMIT = 50;

    private PaginationLimits() {
    }

    public static int clamp(int requested) {
        if (requested <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(requested, MAX_LIMIT);
    }
}
