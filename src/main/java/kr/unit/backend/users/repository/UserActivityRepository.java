package kr.unit.backend.users.repository;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.QueryEntry;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.users.domain.UserStats;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Profile activity index reads.
 *
 * 책임:
 *  - /user_posts/{userId}, /user_comments/{userId}, /user_likes/{userId} 인덱스의 entry 목록 반환
 *  - /user_stats/{userId} read model 반환 (없으면 빈 Optional)
 * 권한 판단/policy는 Service에서 수행한다.
 */
@Repository
public class UserActivityRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public UserActivityRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public Optional<UserStats> findStats(String userId) {
        return realtimeDatabaseClient.get(FirebasePath.userStats(userId), Map.class)
                .map(raw -> {
                    Map<?, ?> data = (Map<?, ?>) raw;
                    return new UserStats(
                            asLong(data.get("posts")),
                            asLong(data.get("comments")),
                            asLong(data.get("likesReceived")),
                            asLong(data.get("scraps")),
                            asLong(data.get("juryVotes")));
                });
    }

    /**
     * 사용자가 작성한 글 인덱스 항목들을 반환한다. 각 entry는 postId + createdAt을 포함한다.
     */
    public List<PostIndexEntry> findUserPosts(String userId) {
        return readIndex(FirebasePath.userPostsRoot(userId), (id, data) -> new PostIndexEntry(
                str(data.get("postId"), id),
                parseInstant(str(data.get("createdAt"), null))));
    }

    /**
     * 사용자가 작성한 댓글 인덱스 항목들을 반환한다. 각 entry는 commentId, postId, createdAt을 포함한다.
     */
    public List<CommentIndexEntry> findUserComments(String userId) {
        return readIndex(FirebasePath.userCommentsRoot(userId), (id, data) -> new CommentIndexEntry(
                str(data.get("commentId"), id),
                str(data.get("postId"), null),
                parseInstant(str(data.get("createdAt"), null))));
    }

    /**
     * 사용자가 추천(좋아요)한 글 인덱스 항목들을 반환한다. 각 entry는 postId + likedAt을 포함한다.
     */
    public List<LikeIndexEntry> findUserLikes(String userId) {
        return readIndex(FirebasePath.userLikesRoot(userId), (id, data) -> new LikeIndexEntry(
                str(data.get("postId"), id),
                parseInstant(str(data.get("likedAt"), null))));
    }

    /**
     * 사용자가 스크랩한 글 인덱스 항목들을 반환한다. 각 entry는 postId + scrappedAt을 포함한다.
     */
    public List<ScrapIndexEntry> findUserScraps(String userId) {
        return readIndex(FirebasePath.userScrapsRoot(userId), (id, data) -> new ScrapIndexEntry(
                str(data.get("postId"), id),
                parseInstant(str(data.get("scrappedAt"), null))));
    }

    /**
     * /user_scraps/{userId}를 scrappedAt DESC 인덱스로 페이지 조회한다. 호출 측은 hasMore 판정을 위해
     * limitPlusOne을 넘긴다. cursor는 {@link kr.unit.backend.common.api.CursorCodec#encode} 형식.
     *
     * 운영 RTDB에서는 /user_scraps/{userId} 노드에 .indexOn: ["scrappedAt"] 필요.
     */
    public List<ScrapIndexEntry> queryUserScrapsDesc(String userId, String cursor, int limitPlusOne) {
        List<QueryEntry<Map>> entries = realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.userScrapsRoot(userId), "scrappedAt", cursor, limitPlusOne, Map.class);
        List<ScrapIndexEntry> result = new ArrayList<>(entries.size());
        for (QueryEntry<Map> entry : entries) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) entry.value();
            if (data == null) {
                continue;
            }
            result.add(new ScrapIndexEntry(
                    str(data.get("postId"), entry.key()),
                    parseInstant(str(data.get("scrappedAt"), null))));
        }
        return result;
    }

    /**
     * /user_posts/{userId}를 createdAt DESC 인덱스로 페이지 조회한다. 운영에서는 .indexOn: ["createdAt"] 필요.
     */
    public List<PostIndexEntry> queryUserPostsDesc(String userId, String cursor, int limitPlusOne) {
        List<QueryEntry<Map>> entries = realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.userPostsRoot(userId), "createdAt", cursor, limitPlusOne, Map.class);
        List<PostIndexEntry> result = new ArrayList<>(entries.size());
        for (QueryEntry<Map> entry : entries) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) entry.value();
            if (data == null) {
                continue;
            }
            result.add(new PostIndexEntry(
                    str(data.get("postId"), entry.key()),
                    parseInstant(str(data.get("createdAt"), null))));
        }
        return result;
    }

    /**
     * /user_comments/{userId}를 createdAt DESC 인덱스로 페이지 조회한다. 운영에서는 .indexOn: ["createdAt"] 필요.
     */
    public List<CommentIndexEntry> queryUserCommentsDesc(String userId, String cursor, int limitPlusOne) {
        List<QueryEntry<Map>> entries = realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.userCommentsRoot(userId), "createdAt", cursor, limitPlusOne, Map.class);
        List<CommentIndexEntry> result = new ArrayList<>(entries.size());
        for (QueryEntry<Map> entry : entries) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) entry.value();
            if (data == null) {
                continue;
            }
            result.add(new CommentIndexEntry(
                    str(data.get("commentId"), entry.key()),
                    str(data.get("postId"), null),
                    parseInstant(str(data.get("createdAt"), null))));
        }
        return result;
    }

    /**
     * /user_likes/{userId}를 likedAt DESC 인덱스로 페이지 조회한다. 운영에서는 .indexOn: ["likedAt"] 필요.
     */
    public List<LikeIndexEntry> queryUserLikesDesc(String userId, String cursor, int limitPlusOne) {
        List<QueryEntry<Map>> entries = realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.userLikesRoot(userId), "likedAt", cursor, limitPlusOne, Map.class);
        List<LikeIndexEntry> result = new ArrayList<>(entries.size());
        for (QueryEntry<Map> entry : entries) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) entry.value();
            if (data == null) {
                continue;
            }
            result.add(new LikeIndexEntry(
                    str(data.get("postId"), entry.key()),
                    parseInstant(str(data.get("likedAt"), null))));
        }
        return result;
    }

    /**
     * 게시판 이름을 /boards/{boardId}/name에서 lookup한다. 없으면 빈 Optional.
     */
    public Optional<String> findBoardName(String boardId) {
        if (boardId == null) {
            return Optional.empty();
        }
        return realtimeDatabaseClient.get(FirebasePath.board(boardId), Map.class)
                .map(raw -> {
                    Object name = raw.get("name");
                    return name == null ? null : name.toString();
                });
    }

    public long countUserPosts(String userId) {
        return countChildren(FirebasePath.userPostsRoot(userId));
    }

    public long countUserComments(String userId) {
        return countChildren(FirebasePath.userCommentsRoot(userId));
    }

    public long countUserLikes(String userId) {
        return countChildren(FirebasePath.userLikesRoot(userId));
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private <T> List<T> readIndex(String path, EntryMapper<T> mapper) {
        Optional<Map> rawOpt = realtimeDatabaseClient.get(path, Map.class);
        if (rawOpt.isEmpty()) {
            return List.of();
        }
        Map<String, Object> raw = (Map<String, Object>) rawOpt.get();
        List<T> result = new ArrayList<>(raw.size());
        for (Map.Entry<String, Object> e : raw.entrySet()) {
            if (!(e.getValue() instanceof Map<?, ?> data)) {
                continue;
            }
            result.add(mapper.map(e.getKey(), data));
        }
        return result;
    }

    private long countChildren(String path) {
        Optional<Map> rawOpt = realtimeDatabaseClient.get(path, Map.class);
        if (rawOpt.isEmpty()) {
            return 0L;
        }
        return ((Map<?, ?>) rawOpt.get()).size();
    }

    @FunctionalInterface
    private interface EntryMapper<T> {
        T map(String id, Map<?, ?> data);
    }

    public record PostIndexEntry(String postId, Instant createdAt) {
    }

    public record CommentIndexEntry(String commentId, String postId, Instant createdAt) {
    }

    public record LikeIndexEntry(String postId, Instant likedAt) {
    }

    public record ScrapIndexEntry(String postId, Instant scrappedAt) {
    }

    private static long asLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number n) {
            return n.longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException ex) {
            return 0L;
        }
    }

    private static String str(Object v, String fallback) {
        return v == null ? fallback : v.toString();
    }

    private static Instant parseInstant(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(raw);
        } catch (Exception ex) {
            return null;
        }
    }
}
