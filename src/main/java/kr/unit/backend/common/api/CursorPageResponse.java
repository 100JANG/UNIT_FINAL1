package kr.unit.backend.common.api;

import java.util.List;

public record CursorPageResponse<T>(List<T> items, Pagination pagination) {

    public static <T> CursorPageResponse<T> of(List<T> items, Cursor cursor) {
        return new CursorPageResponse<>(items, new Pagination(cursor.value(), cursor.hasMore(), cursor.total()));
    }

    public static <T> CursorPageResponse<T> empty() {
        return new CursorPageResponse<>(List.of(), new Pagination(null, false, 0L));
    }

    public record Pagination(String cursor, boolean hasMore, Long total) {
    }
}
