package kr.unit.backend.posts.repository;

import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import kr.unit.backend.posts.domain.Post;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class PostFirebaseRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public PostFirebaseRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public void save(Post post) {
        Map<String, Object> postMap = toMap(post);
        Map<String, Object> feedItem = toFeedItem(post);
        Map<String, Object> stats = Map.of("likes", 0, "comments", 0, "scraps", 0);
        Map<String, Object> userPost = Map.of(
                "postId", post.postId(),
                "createdAt", post.createdAt() == null ? "" : post.createdAt().toString());

        Map<String, Object> updates = new LinkedHashMap<>();
        updates.put(FirebasePath.post(post.postId()), postMap);
        updates.put(FirebasePath.postFeedAll(post.postId()), feedItem);
        if (post.schoolId() != null) {
            updates.put(FirebasePath.postFeedSchool(post.schoolId(), post.postId()), feedItem);
        }
        if (post.departmentId() != null) {
            updates.put(FirebasePath.postFeedDepartment(post.departmentId(), post.postId()), feedItem);
        }
        updates.put(FirebasePath.postStats(post.postId()), stats);
        updates.put(FirebasePath.userPost(post.authorId(), post.postId()), userPost);

        realtimeDatabaseClient.update(updates);
    }

    public Optional<Post> findById(String postId) {
        return realtimeDatabaseClient.get(FirebasePath.post(postId), Map.class)
                .map(raw -> fromMap(postId, raw));
    }

    /**
     * /post_feeds/all 인덱스를 createdAt DESC로 페이지 조회한다. cursor + limit+1 패턴.
     *
     * 운영 RTDB에서는 /post_feeds/all 노드에 .indexOn: ["createdAt"] 필요.
     * 결과 entry는 (postId, feed-snapshot Map) 형태이며 Service가 추가로 /posts/{postId}를 조회해 status를 검증한다.
     */
    public List<kr.unit.backend.firebase.QueryEntry<Map>> queryFeedAllDesc(String cursor, int limitPlusOne) {
        return realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.postFeedAllRoot(), "createdAt", cursor, limitPlusOne, Map.class);
    }

    public List<kr.unit.backend.firebase.QueryEntry<Map>> queryFeedSchoolDesc(
            String schoolId, String cursor, int limitPlusOne) {
        return realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.postFeedSchoolRoot(schoolId), "createdAt", cursor, limitPlusOne, Map.class);
    }

    public List<kr.unit.backend.firebase.QueryEntry<Map>> queryFeedDepartmentDesc(
            String departmentId, String cursor, int limitPlusOne) {
        return realtimeDatabaseClient.queryByChildDesc(
                FirebasePath.postFeedDepartmentRoot(departmentId), "createdAt", cursor, limitPlusOne, Map.class);
    }

    public Map<String, Long> findStats(String postId) {
        return realtimeDatabaseClient.get(FirebasePath.postStats(postId), Map.class)
                .map(raw -> {
                    Map<?, ?> data = (Map<?, ?>) raw;
                    return Map.of(
                            "likes", asLong(data.get("likes")),
                            "comments", asLong(data.get("comments")),
                            "scraps", asLong(data.get("scraps")));
                })
                .orElse(Map.of("likes", 0L, "comments", 0L, "scraps", 0L));
    }

    public boolean isLiked(String postId, String userId) {
        return realtimeDatabaseClient.get(FirebasePath.postLike(postId, userId), Boolean.class)
                .orElse(false);
    }

    public long incrementLikes(String postId, long delta) {
        return realtimeDatabaseClient.increment(FirebasePath.postStats(postId) + "/likes", delta);
    }

    /**
     * 좋아요 상태를 토글한다. /post_likes/{postId}/{userId}와 /user_likes/{userId}/{postId} 양쪽을 함께 갱신해
     * "이 글에 누가 좋아요했나"와 "이 사용자가 어떤 글을 좋아요했나" 양방향 조회가 모두 가능하게 한다.
     *
     * 좋아요 카운터 증감({@link #incrementLikes})은 별도 transaction이므로, 이 메서드는 인덱스 갱신만 담당한다.
     *
     * @param likedAt 좋아요 토글이 발생한 시각. liked=true일 때 /user_likes 항목의 likedAt으로 저장된다.
     */
    public void setLike(String postId, String userId, boolean liked, java.time.Instant likedAt) {
        if (liked) {
            realtimeDatabaseClient.set(FirebasePath.postLike(postId, userId), true);
            Map<String, Object> userLikeEntry = new HashMap<>();
            userLikeEntry.put("postId", postId);
            userLikeEntry.put("likedAt", likedAt == null ? null : likedAt.toString());
            realtimeDatabaseClient.set(FirebasePath.userLike(userId, postId), userLikeEntry);
        } else {
            realtimeDatabaseClient.delete(FirebasePath.postLike(postId, userId));
            realtimeDatabaseClient.delete(FirebasePath.userLike(userId, postId));
        }
    }

    private static Map<String, Object> toMap(Post post) {
        Map<String, Object> data = new HashMap<>();
        data.put("postId", post.postId());
        data.put("boardId", post.boardId());
        data.put("schoolId", post.schoolId());
        data.put("departmentId", post.departmentId());
        data.put("authorId", post.authorId());
        data.put("anonymousId", post.anonymousId());
        data.put("title", post.title());
        data.put("content", post.content());
        data.put("tags", post.tags());
        data.put("visibility", post.visibility().name());
        data.put("status", post.status().name());
        data.put("createdAt", post.createdAt() == null ? null : post.createdAt().toString());
        data.put("updatedAt", post.updatedAt() == null ? null : post.updatedAt().toString());
        return data;
    }

    private static Map<String, Object> toFeedItem(Post post) {
        Map<String, Object> item = new HashMap<>();
        item.put("postId", post.postId());
        item.put("boardId", post.boardId());
        item.put("title", post.title());
        item.put("preview", buildPreview(post.content()));
        item.put("schoolId", post.schoolId());
        item.put("departmentId", post.departmentId());
        item.put("anonymousId", post.anonymousId());
        item.put("createdAt", post.createdAt() == null ? null : post.createdAt().toString());
        item.put("stats", Map.of("likes", 0, "comments", 0, "scraps", 0));
        return item;
    }

    private static String buildPreview(String content) {
        if (content == null) {
            return "";
        }
        String trimmed = content.replaceAll("\\s+", " ").trim();
        return trimmed.length() <= 60 ? trimmed : trimmed.substring(0, 60);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private static Post fromMap(String postId, Map raw) {
        Map<String, Object> data = (Map<String, Object>) raw;
        java.util.List<String> tags = (java.util.List<String>) data.getOrDefault("tags", java.util.List.of());
        return new Post(
                postId,
                str(data.get("boardId")),
                str(data.get("schoolId")),
                str(data.get("departmentId")),
                str(data.get("authorId")),
                str(data.get("anonymousId")),
                str(data.get("title")),
                str(data.get("content")),
                tags == null ? java.util.List.of() : tags,
                Post.Visibility.valueOf(defaultIfNull(str(data.get("visibility")), "PUBLIC")),
                Post.Status.valueOf(defaultIfNull(str(data.get("status")), "PUBLISHED")),
                parseInstant(str(data.get("createdAt"))),
                parseInstant(str(data.get("updatedAt"))));
    }

    private static String str(Object v) {
        return v == null ? null : v.toString();
    }

    private static String defaultIfNull(String v, String fallback) {
        return v == null || v.isBlank() ? fallback : v;
    }

    private static java.time.Instant parseInstant(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return java.time.Instant.parse(raw);
        } catch (Exception ex) {
            return null;
        }
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
}
