package kr.unit.backend.firebase;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.MutableData;
import com.google.firebase.database.Query;
import com.google.firebase.database.Transaction;
import com.google.firebase.database.ValueEventListener;
import kr.unit.backend.common.api.CursorCodec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Firebase Admin SDK를 직접 사용하는 RealtimeDatabaseClient 구현체.
 * unit.firebase.enabled=true이고 FirebaseDatabase 빈이 존재할 때만 활성화된다.
 *
 * 도메인 코드(Service/Repository)는 이 클래스를 직접 알 필요 없이 RealtimeDatabaseClient 인터페이스만 사용한다.
 */
@Component
@ConditionalOnProperty(prefix = "unit.firebase", name = "enabled", havingValue = "true")
public class FirebaseAdminRealtimeDatabaseClient implements RealtimeDatabaseClient {

    private static final Logger log = LoggerFactory.getLogger(FirebaseAdminRealtimeDatabaseClient.class);
    private static final long DEFAULT_TIMEOUT_SECONDS = 10;

    private final FirebaseDatabase firebaseDatabase;

    public FirebaseAdminRealtimeDatabaseClient(FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> Optional<T> get(String path, Class<T> type) {
        DatabaseReference ref = firebaseDatabase.getReference(path);
        CompletableFuture<DataSnapshot> future = new CompletableFuture<>();
        ref.addListenerForSingleValueEvent(new com.google.firebase.database.ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                future.complete(snapshot);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        try {
            DataSnapshot snapshot = future.get(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!snapshot.exists()) {
                return Optional.empty();
            }
            Object value = snapshot.getValue(type);
            return Optional.ofNullable((T) value);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Firebase get interrupted: " + path, ex);
        } catch (java.util.concurrent.ExecutionException | TimeoutException ex) {
            throw new IllegalStateException("Firebase get failed: " + path, ex);
        }
    }

    @Override
    public void set(String path, Object value) {
        DatabaseReference ref = firebaseDatabase.getReference(path);
        CompletableFuture<Void> future = new CompletableFuture<>();
        ref.setValue(value, (error, completedRef) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });
        await(future, "set " + path);
    }

    @Override
    public void update(Map<String, Object> updates) {
        DatabaseReference root = firebaseDatabase.getReference();
        CompletableFuture<Void> future = new CompletableFuture<>();
        root.updateChildren(updates, (error, completedRef) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });
        await(future, "updateChildren");
    }

    @Override
    public void delete(String path) {
        DatabaseReference ref = firebaseDatabase.getReference(path);
        CompletableFuture<Void> future = new CompletableFuture<>();
        ref.removeValue((error, completedRef) -> {
            if (error != null) {
                future.completeExceptionally(error.toException());
            } else {
                future.complete(null);
            }
        });
        await(future, "delete " + path);
    }

    @Override
    public long increment(String path, long delta) {
        DatabaseReference ref = firebaseDatabase.getReference(path);
        CompletableFuture<Long> future = new CompletableFuture<>();
        ref.runTransaction(new Transaction.Handler() {
            @Override
            public Transaction.Result doTransaction(MutableData mutableData) {
                Long current = mutableData.getValue(Long.class);
                long next = (current == null ? 0L : current) + delta;
                mutableData.setValue(next);
                return Transaction.success(mutableData);
            }

            @Override
            public void onComplete(DatabaseError error, boolean committed, DataSnapshot snapshot) {
                if (error != null) {
                    future.completeExceptionally(error.toException());
                } else if (!committed) {
                    future.completeExceptionally(new IllegalStateException("Increment transaction not committed: " + path));
                } else {
                    Long value = snapshot.getValue(Long.class);
                    future.complete(value == null ? 0L : value);
                }
            }
        });
        try {
            return future.get(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Firebase increment interrupted: " + path, ex);
        } catch (java.util.concurrent.ExecutionException | TimeoutException ex) {
            throw new IllegalStateException("Firebase increment failed: " + path, ex);
        }
    }

    @Override
    public <T> List<QueryEntry<T>> queryByChildDesc(
            String path, String orderByChild, String cursor, int limit, Class<T> type) {
        if (limit <= 0) {
            return List.of();
        }
        // endAt is inclusive — fetch limit+1 to make room for the cursor item we'll discard.
        int fetch = cursor != null && !cursor.isBlank() ? limit + 1 : limit;
        Query query = firebaseDatabase.getReference(path)
                .orderByChild(orderByChild)
                .limitToLast(fetch);
        String cursorId = null;
        if (cursor != null && !cursor.isBlank()) {
            CursorCodec.OpaqueCursorKey ck = CursorCodec.decodeString(cursor);
            String primary = ck.primary().isEmpty() ? null : ck.primary();
            cursorId = ck.id();
            query = query.endAt(primary, cursorId);
        }
        DataSnapshot snapshot = awaitSnapshot(query, "queryByChildDesc " + path);
        List<QueryEntry<T>> ascResult = collectChildren(snapshot, type);
        // RTDB의 limitToLast 결과는 ASC이므로 DESC 노출을 위해 뒤집는다.
        Collections.reverse(ascResult);
        if (cursorId != null) {
            final String exclude = cursorId;
            ascResult.removeIf(e -> exclude.equals(e.key()));
        }
        if (ascResult.size() > limit) {
            ascResult = new ArrayList<>(ascResult.subList(0, limit));
        }
        return ascResult;
    }

    @Override
    public <T> List<QueryEntry<T>> queryByChildAsc(
            String path, String orderByChild, String cursor, int limit, Class<T> type) {
        if (limit <= 0) {
            return List.of();
        }
        int fetch = cursor != null && !cursor.isBlank() ? limit + 1 : limit;
        Query query = firebaseDatabase.getReference(path)
                .orderByChild(orderByChild)
                .limitToFirst(fetch);
        String cursorId = null;
        if (cursor != null && !cursor.isBlank()) {
            CursorCodec.OpaqueCursorKey ck = CursorCodec.decodeString(cursor);
            String primary = ck.primary().isEmpty() ? null : ck.primary();
            cursorId = ck.id();
            query = query.startAt(primary, cursorId);
        }
        DataSnapshot snapshot = awaitSnapshot(query, "queryByChildAsc " + path);
        List<QueryEntry<T>> result = collectChildren(snapshot, type);
        if (cursorId != null) {
            final String exclude = cursorId;
            result.removeIf(e -> exclude.equals(e.key()));
        }
        if (result.size() > limit) {
            result = new ArrayList<>(result.subList(0, limit));
        }
        return result;
    }

    private DataSnapshot awaitSnapshot(Query query, String op) {
        CompletableFuture<DataSnapshot> future = new CompletableFuture<>();
        query.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                future.complete(snapshot);
            }

            @Override
            public void onCancelled(DatabaseError error) {
                future.completeExceptionally(error.toException());
            }
        });
        try {
            return future.get(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Firebase op interrupted: " + op, ex);
        } catch (java.util.concurrent.ExecutionException | TimeoutException ex) {
            throw new IllegalStateException("Firebase op failed: " + op, ex);
        }
    }

    private static <T> List<QueryEntry<T>> collectChildren(DataSnapshot snapshot, Class<T> type) {
        List<QueryEntry<T>> result = new ArrayList<>((int) snapshot.getChildrenCount());
        for (DataSnapshot child : snapshot.getChildren()) {
            T value = child.getValue(type);
            result.add(new QueryEntry<>(child.getKey(), value));
        }
        return result;
    }

    private void await(CompletableFuture<Void> future, String op) {
        try {
            future.get(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Firebase op interrupted: " + op, ex);
        } catch (java.util.concurrent.ExecutionException | TimeoutException ex) {
            log.warn("Firebase op failed: {}", op);
            throw new IllegalStateException("Firebase op failed: " + op, ex);
        }
    }
}
