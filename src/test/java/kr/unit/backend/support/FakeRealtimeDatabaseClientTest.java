package kr.unit.backend.support;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class FakeRealtimeDatabaseClientTest {

    @Test
    void setAndGetRoundTrips() {
        FakeRealtimeDatabaseClient db = new FakeRealtimeDatabaseClient();
        db.set("/posts/p_1", Map.of("title", "안녕"));

        Optional<Map> result = db.get("/posts/p_1", Map.class);
        assertThat(result).isPresent();
        assertThat(result.get()).containsEntry("title", "안녕");
    }

    @Test
    void deleteRemovesValue() {
        FakeRealtimeDatabaseClient db = new FakeRealtimeDatabaseClient();
        db.set("/x", Map.of("v", 1));
        db.delete("/x");
        assertThat(db.get("/x", Map.class)).isEmpty();
    }

    @Test
    void incrementIsAtomicAndPersistsInStore() {
        FakeRealtimeDatabaseClient db = new FakeRealtimeDatabaseClient();
        long first = db.increment("/post_stats/p_1/likes", 1L);
        long second = db.increment("/post_stats/p_1/likes", 1L);
        long third = db.increment("/post_stats/p_1/likes", -1L);
        assertThat(first).isEqualTo(1L);
        assertThat(second).isEqualTo(2L);
        assertThat(third).isEqualTo(1L);
        assertThat(db.get("/post_stats/p_1/likes", Long.class)).contains(1L);
    }

    @Test
    void updateAppliesAllPaths() {
        FakeRealtimeDatabaseClient db = new FakeRealtimeDatabaseClient();
        db.update(Map.of(
                "/a", Map.of("x", 1),
                "/b", Map.of("y", 2)));
        assertThat(db.get("/a", Map.class)).isPresent();
        assertThat(db.get("/b", Map.class)).isPresent();
    }
}
