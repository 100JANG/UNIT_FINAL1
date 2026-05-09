package kr.unit.backend.common.api;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Comparator;

/**
 * 모든 cursor 기반 목록 API가 공유하는 단일 cursor 직렬화/비교 유틸리티.
 *
 * cursor 포맷: base64url("&lt;primary&gt;|&lt;tie-breaker id&gt;"). primary는 ISO-8601 timestamp
 * 또는 임의의 String일 수 있다. 두 모드 모두 동일한 base64 raw 포맷을 공유한다.
 *
 * 직접 인코딩/디코딩을 새로 만들지 말고 이 클래스를 사용하라 (중복 구현 금지).
 *
 * Instant-based API ({@link #encode(Instant, String)}, {@link #decode}, {@link #compare})는
 * timestamp 정렬을 사용하는 대부분의 도메인(post/comment/scrap/like 등)에서 그대로 쓴다.
 *
 * String-opaque API ({@link #encodeString}, {@link #decodeString}, {@link #compareString})는
 * timestamp가 아닌 임의 문자열(예: courseName) 정렬에 쓴다. RealtimeDatabaseClient의 query 메서드는
 * 항상 String-opaque 변환을 통해 cursor를 처리한다.
 */
public final class CursorCodec {

    private CursorCodec() {
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Instant-based API
    // ─────────────────────────────────────────────────────────────────────────

    public static String encode(Instant timestamp, String id) {
        return encodeString(timestamp == null ? null : timestamp.toString(), id);
    }

    public static CursorKey decode(String cursor) {
        OpaqueCursorKey opaque = decodeString(cursor);
        Instant ts;
        try {
            ts = opaque.primary().isEmpty() ? null : Instant.parse(opaque.primary());
        } catch (Exception ex) {
            throw new IllegalArgumentException("invalid cursor timestamp");
        }
        return new CursorKey(ts, opaque.id());
    }

    /**
     * (timestamp, id) 튜플을 ASC 기준으로 비교한다. timestamp는 nullsLast로 취급한다.
     * - 음수: a가 b보다 앞(작음) — ASC로 더 빠르게 나타남
     * - 양수: a가 b보다 뒤(큼)
     * - 0: 동일
     */
    public static int compare(Instant aTimestamp, String aId, Instant bTimestamp, String bId) {
        int c = Comparator.<Instant>nullsLast(Comparator.naturalOrder())
                .compare(aTimestamp, bTimestamp);
        if (c != 0) {
            return c;
        }
        return Comparator.<String>nullsLast(Comparator.naturalOrder()).compare(aId, bId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // String-opaque API (used by RTDB query layer + non-timestamp orderings)
    // ─────────────────────────────────────────────────────────────────────────

    public static String encodeString(String primary, String id) {
        if (id == null) {
            throw new IllegalArgumentException("cursor id must not be null");
        }
        String raw = (primary == null ? "" : primary) + "|" + id;
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public static OpaqueCursorKey decodeString(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            throw new IllegalArgumentException("cursor must not be blank");
        }
        String raw;
        try {
            raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("invalid cursor encoding");
        }
        int sep = raw.indexOf('|');
        if (sep < 0) {
            throw new IllegalArgumentException("invalid cursor format");
        }
        String primary = raw.substring(0, sep);
        String id = raw.substring(sep + 1);
        return new OpaqueCursorKey(primary, id);
    }

    /**
     * 두 (primary, id) 튜플을 ASC 기준으로 lexicographic 비교한다. primary, id 모두 nullsLast.
     * ISO-8601 timestamp 문자열도 lexicographic 비교가 정렬 순서와 일치하므로 Instant-based 비교의
     * 일관된 대체로 사용할 수 있다.
     */
    public static int compareString(String aPrimary, String aId, String bPrimary, String bId) {
        int c = Comparator.<String>nullsLast(Comparator.naturalOrder()).compare(aPrimary, bPrimary);
        if (c != 0) {
            return c;
        }
        return Comparator.<String>nullsLast(Comparator.naturalOrder()).compare(aId, bId);
    }

    public record CursorKey(Instant timestamp, String id) {
    }

    public record OpaqueCursorKey(String primary, String id) {
    }
}
