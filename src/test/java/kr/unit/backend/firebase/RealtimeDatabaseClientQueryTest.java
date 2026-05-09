package kr.unit.backend.firebase;

import kr.unit.backend.common.api.CursorCodec;
import kr.unit.backend.support.FakeRealtimeDatabaseClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * RealtimeDatabaseClient.queryByChildDesc / queryByChildAsc 의 의미론을 FakeRealtimeDatabaseClient를 통해 검증한다.
 *
 * Real Firebase Admin SDK 구현은 RTDB Query API에 위임하므로 별도이지만, in-memory 구현(Fake/InMemory)은
 * 공통 헬퍼 RealtimeDatabaseQuerySupport를 사용한다. 본 테스트는 그 헬퍼의 정렬/cursor/limit/null 동작을
 * 모두 강제한다.
 */
class RealtimeDatabaseClientQueryTest {

    private FakeRealtimeDatabaseClient db;

    @BeforeEach
    void setUp() {
        db = new FakeRealtimeDatabaseClient();
    }

    @Test
    void queryByChildDesc_returnsNewestFirst() {
        seedFeed("p_a", "2026-05-01T00:00:00Z");
        seedFeed("p_b", "2026-05-02T00:00:00Z");
        seedFeed("p_c", "2026-05-03T00:00:00Z");

        List<QueryEntry<Map>> result = db.queryByChildDesc(
                "/post_feeds/all", "createdAt", null, 10, Map.class);

        assertThat(result).extracting(QueryEntry::key)
                .containsExactly("p_c", "p_b", "p_a");
    }

    @Test
    void queryByChildDesc_respectsLimit() {
        for (int i = 0; i < 5; i++) {
            seedFeed("p_" + i, "2026-05-0" + (i + 1) + "T00:00:00Z");
        }

        List<QueryEntry<Map>> result = db.queryByChildDesc(
                "/post_feeds/all", "createdAt", null, 2, Map.class);

        assertThat(result).hasSize(2);
        // newest 2 items: p_4 (05-05), p_3 (05-04)
        assertThat(result).extracting(QueryEntry::key)
                .containsExactly("p_4", "p_3");
    }

    @Test
    void queryByChildDesc_supportsCursor() {
        // 4 items, page1 limit=2 → newest 2; cursor; page2 → next 2
        seedFeed("p_a", "2026-05-01T00:00:00Z");
        seedFeed("p_b", "2026-05-02T00:00:00Z");
        seedFeed("p_c", "2026-05-03T00:00:00Z");
        seedFeed("p_d", "2026-05-04T00:00:00Z");

        List<QueryEntry<Map>> page1 = db.queryByChildDesc(
                "/post_feeds/all", "createdAt", null, 2, Map.class);
        assertThat(page1).extracting(QueryEntry::key).containsExactly("p_d", "p_c");

        QueryEntry<Map> last = page1.get(page1.size() - 1);
        String lastTs = (String) last.value().get("createdAt");
        String cursor = CursorCodec.encodeString(lastTs, last.key());

        List<QueryEntry<Map>> page2 = db.queryByChildDesc(
                "/post_feeds/all", "createdAt", cursor, 2, Map.class);
        assertThat(page2).extracting(QueryEntry::key).containsExactly("p_b", "p_a");
    }

    @Test
    void queryByChildDesc_handlesSameTimestampWithIdTieBreak() {
        // 동일 createdAt에서 key DESC로 안정 정렬 (큰 key가 앞에)
        String sameTs = "2026-05-01T00:00:00Z";
        seedFeed("p_a", sameTs);
        seedFeed("p_b", sameTs);
        seedFeed("p_c", sameTs);

        List<QueryEntry<Map>> result = db.queryByChildDesc(
                "/post_feeds/all", "createdAt", null, 10, Map.class);

        assertThat(result).extracting(QueryEntry::key)
                .containsExactly("p_c", "p_b", "p_a");

        // cursor가 p_b를 가리키면 cursor 항목은 strict 제외 → p_a만 남음
        String cursor = CursorCodec.encodeString(sameTs, "p_b");
        List<QueryEntry<Map>> next = db.queryByChildDesc(
                "/post_feeds/all", "createdAt", cursor, 10, Map.class);
        assertThat(next).extracting(QueryEntry::key).containsExactly("p_a");
    }

    @Test
    void queryByChildDesc_returnsEmptyWhenPathMissing() {
        List<QueryEntry<Map>> result = db.queryByChildDesc(
                "/non_existing/path", "createdAt", null, 10, Map.class);

        assertThat(result).isEmpty();
    }

    @Test
    void queryByChildAsc_returnsOldestFirstAndCursorWorks() {
        seedFeed("p_a", "2026-05-01T00:00:00Z");
        seedFeed("p_b", "2026-05-02T00:00:00Z");
        seedFeed("p_c", "2026-05-03T00:00:00Z");

        List<QueryEntry<Map>> page1 = db.queryByChildAsc(
                "/post_feeds/all", "createdAt", null, 2, Map.class);
        assertThat(page1).extracting(QueryEntry::key).containsExactly("p_a", "p_b");

        QueryEntry<Map> last = page1.get(page1.size() - 1);
        String cursor = CursorCodec.encodeString((String) last.value().get("createdAt"), last.key());
        List<QueryEntry<Map>> page2 = db.queryByChildAsc(
                "/post_feeds/all", "createdAt", cursor, 2, Map.class);
        assertThat(page2).extracting(QueryEntry::key).containsExactly("p_c");
    }

    private void seedFeed(String postId, String createdAt) {
        db.set("/post_feeds/all/" + postId, Map.of(
                "postId", postId,
                "createdAt", createdAt,
                "title", "title-" + postId));
    }
}
