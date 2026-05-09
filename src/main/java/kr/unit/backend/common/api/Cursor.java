package kr.unit.backend.common.api;

public record Cursor(String value, boolean hasMore, Long total) {

    public static Cursor of(String value, boolean hasMore) {
        return new Cursor(value, hasMore, null);
    }

    public static Cursor of(String value, boolean hasMore, Long total) {
        return new Cursor(value, hasMore, total);
    }

    public static Cursor end() {
        return new Cursor(null, false, null);
    }
}
