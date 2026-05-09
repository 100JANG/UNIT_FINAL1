package kr.unit.backend.firebase;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.unit.backend.common.api.CursorCodec;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * RealtimeDatabaseClient의 query 메서드를 메모리 저장소(Fake/InMemory)에서 동일한 의미로 구현하기 위한 공유 유틸.
 *
 * 실제 Firebase Admin SDK 구현은 RTDB Query API를 직접 사용하므로 별도이다. 본 헬퍼는 다음을 보장한다:
 * - {@code path} 자식들을 {@code orderByChild} 값(String, nullsLast) + 자식 key(tie-breaker, nullsLast)로 정렬
 * - DESC면 정렬 결과를 reverse
 * - cursor가 주어지면 DESC: compare(item, cursor) &lt; 0 만, ASC: compare(item, cursor) &gt; 0 만 남긴다
 * - {@code limit}개로 잘라 반환
 *
 * 자식이 Map이 아닌 경우(스칼라 leaf) orderValue를 null로 보고 nullsLast 위치에 배치한다.
 * type이 Map.class가 아니면 ObjectMapper로 변환한다.
 */
public final class RealtimeDatabaseQuerySupport {

    private RealtimeDatabaseQuerySupport() {
    }

    public static <T> List<QueryEntry<T>> inMemoryQuery(
            RealtimeDatabaseClient client,
            String path,
            String orderByChild,
            String cursor,
            int limit,
            Class<T> type,
            boolean descending,
            ObjectMapper objectMapper) {
        if (limit <= 0) {
            return List.of();
        }

        Optional<Map> rawOpt = client.get(path, Map.class);
        if (rawOpt.isEmpty()) {
            return List.of();
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> children = (Map<String, Object>) rawOpt.get();

        List<RawEntry> entries = new ArrayList<>(children.size());
        for (Map.Entry<String, Object> e : children.entrySet()) {
            entries.add(new RawEntry(e.getKey(), e.getValue(), extractOrderValue(e.getValue(), orderByChild)));
        }

        Comparator<RawEntry> ascCmp = (a, b) ->
                CursorCodec.compareString(a.orderValue, a.key, b.orderValue, b.key);
        entries.sort(descending ? ascCmp.reversed() : ascCmp);

        if (cursor != null && !cursor.isBlank()) {
            CursorCodec.OpaqueCursorKey ck = CursorCodec.decodeString(cursor);
            entries.removeIf(entry -> {
                int cmp = CursorCodec.compareString(entry.orderValue, entry.key, ck.primary(), ck.id());
                return descending ? cmp >= 0 : cmp <= 0;
            });
        }

        if (entries.size() > limit) {
            entries = entries.subList(0, limit);
        }

        List<QueryEntry<T>> result = new ArrayList<>(entries.size());
        for (RawEntry entry : entries) {
            T converted = convertValue(entry.value, type, objectMapper);
            result.add(new QueryEntry<>(entry.key, converted));
        }
        return result;
    }

    private static String extractOrderValue(Object value, String orderByChild) {
        if (value instanceof Map<?, ?> map) {
            Object v = map.get(orderByChild);
            return v == null ? null : v.toString();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private static <T> T convertValue(Object value, Class<T> type, ObjectMapper objectMapper) {
        if (value == null) {
            return null;
        }
        if (type.isInstance(value)) {
            return (T) value;
        }
        return objectMapper.convertValue(value, type);
    }

    private record RawEntry(String key, Object value, String orderValue) {
    }
}
