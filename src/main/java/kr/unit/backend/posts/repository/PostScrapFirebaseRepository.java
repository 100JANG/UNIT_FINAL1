package kr.unit.backend.posts.repository;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 스크랩 토글 RTDB 어댑터.
 *
 * 책임: /post_scraps, /user_scraps 양방향 인덱스 + post_stats.scraps + user_stats.scraps 카운터 갱신.
 *      카운터는 음수 floor(0) 보호를 적용한다.
 *
 * 모든 RTDB 경로는 FirebasePath에서만 조립한다.
 */
@Repository
public class PostScrapFirebaseRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public PostScrapFirebaseRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public boolean isScrapped(String postId, String userId) {
        return realtimeDatabaseClient.get(FirebasePath.postScrap(postId, userId), Boolean.class)
                .orElse(false);
    }

    /**
     * 스크랩 등록: 양방향 set + post/user_stats.scraps +1.
     * @return 갱신된 (totalPostScraps, totalUserScraps), 둘 다 음수 방어 적용.
     */
    public ScrapToggleResult addScrap(String postId, String userId, Instant scrappedAt) {
        Map<String, Object> userScrapEntry = new HashMap<>();
        userScrapEntry.put("postId", postId);
        userScrapEntry.put("scrappedAt", scrappedAt == null ? null : scrappedAt.toString());

        Map<String, Object> updates = new LinkedHashMap<>();
        updates.put(FirebasePath.postScrap(postId, userId), true);
        updates.put(FirebasePath.userScrap(userId, postId), userScrapEntry);
        realtimeDatabaseClient.update(updates);

        long postScraps = realtimeDatabaseClient.increment(FirebasePath.postStatsScraps(postId), 1L);
        long userScraps = realtimeDatabaseClient.increment(FirebasePath.userStatsScraps(userId), 1L);
        return new ScrapToggleResult(true, Math.max(0L, postScraps), Math.max(0L, userScraps));
    }

    /**
     * 스크랩 취소: 양방향 delete + post/user_stats.scraps -1, 음수 floor(0) 보호.
     */
    public ScrapToggleResult removeScrap(String postId, String userId) {
        realtimeDatabaseClient.delete(FirebasePath.postScrap(postId, userId));
        realtimeDatabaseClient.delete(FirebasePath.userScrap(userId, postId));
        long postScraps = decrementWithFloor(FirebasePath.postStatsScraps(postId));
        long userScraps = decrementWithFloor(FirebasePath.userStatsScraps(userId));
        return new ScrapToggleResult(false, postScraps, userScraps);
    }

    /**
     * -1 increment 후 결과가 음수면 0으로 clamp 저장한다. 데이터 불일치 등으로 카운터가 실제 보유분을
     * 넘어 차감되더라도 노출/저장 모두 0이 되도록 방어한다.
     */
    private long decrementWithFloor(String path) {
        long updated = realtimeDatabaseClient.increment(path, -1L);
        if (updated < 0L) {
            realtimeDatabaseClient.set(path, 0L);
            return 0L;
        }
        return updated;
    }

    public record ScrapToggleResult(boolean scrapped, long totalPostScraps, long totalUserScraps) {
    }
}
