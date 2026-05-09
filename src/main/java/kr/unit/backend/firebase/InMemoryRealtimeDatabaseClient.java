package kr.unit.backend.firebase;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.unit.backend.common.config.JacksonConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 로컬 개발 환경에서 Firebase RTDB가 활성화되지 않았을 때 사용하는 메모리 기반 fallback.
 * 운영 환경에서는 FirebaseAdminRealtimeDatabaseClient가 우선 활성화된다.
 *
 * Firebase RTDB의 JSON tree 의미를 따른다:
 *  - set(path, Map): Map의 각 키를 path/key 형태의 leaf로 분해 저장
 *  - get(path): exact leaf가 없으면 자식 path를 재귀적으로 집계해 nested Map으로 반환
 * 이렇게 해야 increment(path/leaf)와 set(path, Map)이 어우러진다.
 */
@Component
@ConditionalOnProperty(prefix = "unit.firebase", name = "enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryRealtimeDatabaseClient implements RealtimeDatabaseClient {

    private static final Logger log = LoggerFactory.getLogger(InMemoryRealtimeDatabaseClient.class);

    private final ConcurrentMap<String, Object> store = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AtomicLong> counters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = JacksonConfig.baseMapper();

    public InMemoryRealtimeDatabaseClient() {
        log.warn("Using InMemoryRealtimeDatabaseClient (Firebase disabled). Do not use in production.");
    }

    @Override
    public <T> Optional<T> get(String path, Class<T> type) {
        Object exact = store.get(path);
        if (exact != null) {
            return convert(exact, type);
        }
        Map<String, Object> aggregated = aggregateChildren(path);
        if (aggregated.isEmpty()) {
            return Optional.empty();
        }
        return convert(aggregated, type);
    }

    @Override
    public void set(String path, Object value) {
        if (value == null) {
            removeRecursively(path);
            return;
        }
        if (value instanceof Map<?, ?> map) {
            removeRecursively(path);
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                set(path + "/" + entry.getKey(), entry.getValue());
            }
            return;
        }
        store.put(path, value);
    }

    @Override
    public void update(Map<String, Object> updates) {
        updates.forEach(this::set);
    }

    @Override
    public void delete(String path) {
        removeRecursively(path);
    }

    @Override
    public <T> List<QueryEntry<T>> queryByChildDesc(
            String path, String orderByChild, String cursor, int limit, Class<T> type) {
        return RealtimeDatabaseQuerySupport.inMemoryQuery(
                this, path, orderByChild, cursor, limit, type, true, objectMapper);
    }

    @Override
    public <T> List<QueryEntry<T>> queryByChildAsc(
            String path, String orderByChild, String cursor, int limit, Class<T> type) {
        return RealtimeDatabaseQuerySupport.inMemoryQuery(
                this, path, orderByChild, cursor, limit, type, false, objectMapper);
    }

    @Override
    public long increment(String path, long delta) {
        AtomicLong counter = counters.computeIfAbsent(path, p -> {
            Object current = store.get(p);
            if (current instanceof Number n) {
                return new AtomicLong(n.longValue());
            }
            return new AtomicLong(0L);
        });
        long next = counter.addAndGet(delta);
        store.put(path, next);
        return next;
    }

    private void removeRecursively(String path) {
        store.remove(path);
        counters.remove(path);
        String prefix = path + "/";
        List<String> toRemove = new ArrayList<>();
        for (String key : store.keySet()) {
            if (key.startsWith(prefix)) {
                toRemove.add(key);
            }
        }
        for (String key : toRemove) {
            store.remove(key);
            counters.remove(key);
        }
    }

    private Map<String, Object> aggregateChildren(String path) {
        String prefix = path + "/";
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : store.entrySet()) {
            String key = entry.getKey();
            if (!key.startsWith(prefix)) {
                continue;
            }
            String rest = key.substring(prefix.length());
            int slashIndex = rest.indexOf('/');
            if (slashIndex < 0) {
                result.put(rest, entry.getValue());
            } else {
                String firstSegment = rest.substring(0, slashIndex);
                if (!result.containsKey(firstSegment)) {
                    Map<String, Object> nested = aggregateChildren(path + "/" + firstSegment);
                    if (!nested.isEmpty()) {
                        result.put(firstSegment, nested);
                    } else {
                        Object exactNested = store.get(path + "/" + firstSegment);
                        if (exactNested != null) {
                            result.put(firstSegment, exactNested);
                        }
                    }
                }
            }
        }
        return result;
    }

    private <T> Optional<T> convert(Object value, Class<T> type) {
        if (type.isInstance(value)) {
            return Optional.of(type.cast(value));
        }
        return Optional.ofNullable(objectMapper.convertValue(value, type));
    }
}
