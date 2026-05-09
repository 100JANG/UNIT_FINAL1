package kr.unit.backend.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import kr.unit.backend.common.config.JacksonConfig;
import kr.unit.backend.firebase.QueryEntry;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.firebase.RealtimeDatabaseQuerySupport;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 테스트용 Fake. RealtimeDatabaseClient 인터페이스의 메모리 구현이다.
 *
 * Firebase RTDB는 JSON tree이므로:
 *  - set(path, Map) 호출 시 Map의 각 키를 path/key 형태의 leaf로 분해 저장한다.
 *  - get(path) 호출 시 정확한 leaf가 없으면 자식 path들을 재귀적으로 집계해 nested Map으로 반환한다.
 * 이렇게 해야 increment(path/leaf)와 set(path, Map)이 자연스럽게 어우러진다.
 */
public class FakeRealtimeDatabaseClient implements RealtimeDatabaseClient {

    private final ConcurrentMap<String, Object> store = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AtomicLong> counters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = JacksonConfig.baseMapper();

    public Map<String, Object> snapshot() {
        return new HashMap<>(store);
    }

    public void clear() {
        store.clear();
        counters.clear();
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
