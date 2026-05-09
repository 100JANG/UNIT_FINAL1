package kr.unit.backend.firebase;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Firebase Realtime Database 추상화. Service/Repository 외부 계층에서 RTDB 호출은 이 인터페이스로만 한다.
 * Firebase Admin SDK 객체를 직접 노출하지 않는다.
 */
public interface RealtimeDatabaseClient {

    <T> Optional<T> get(String path, Class<T> type);

    void set(String path, Object value);

    void update(Map<String, Object> updates);

    void delete(String path);

    long increment(String path, long delta);

    /**
     * {@code path} 아래 자식들을 {@code orderByChild} 필드 기준 DESC(내림차순)로 정렬해 최대 {@code limit}개를 반환한다.
     *
     * <p>{@code cursor}가 주어지면 cursor가 가리키는 (orderValue, key) 튜플보다 strictly 작은 항목만 반환한다 (DESC 진행).
     * cursor 인코딩은 {@link kr.unit.backend.common.api.CursorCodec#encodeString} 또는 호환되는 {@code encode} 결과여야 한다.
     *
     * <p>orderByChild 값이 null이거나 자식이 Map이 아닌 경우, 해당 항목은 nullsLast 위치에 배치된다.
     *
     * <p>실제 운영 환경에서는 Firebase RTDB Security Rules의 {@code .indexOn}에 {@code orderByChild}가 등재되어야
     * 효율적으로 동작한다. 등재되지 않으면 RTDB가 클라이언트 측 정렬로 fallback해 비싸진다.
     */
    <T> List<QueryEntry<T>> queryByChildDesc(
            String path, String orderByChild, String cursor, int limit, Class<T> type);

    /**
     * {@link #queryByChildDesc}의 ASC(오름차순) 버전. cursor 이후(strictly 큰) 항목을 반환한다.
     */
    <T> List<QueryEntry<T>> queryByChildAsc(
            String path, String orderByChild, String cursor, int limit, Class<T> type);
}
