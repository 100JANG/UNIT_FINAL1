package kr.unit.backend.comments.repository;

import kr.unit.backend.comments.domain.Comment;
import kr.unit.backend.firebase.FirebasePath;
import kr.unit.backend.firebase.QueryEntry;
import kr.unit.backend.firebase.RealtimeDatabaseClient;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Comment 도메인 RTDB 어댑터.
 *
 * 책임: /comments, /comment_stats, /comment_likes, /user_comments, /post_stats/{postId}/comments 의
 *       leaf-level write/read만 담당한다. 권한 판단/대댓글 정책은 Service에서 수행한다.
 *
 * 모든 RTDB 경로는 FirebasePath에서만 조립한다. (backend/08, harness/02 §2)
 */
@Repository
public class CommentFirebaseRepository {

    private final RealtimeDatabaseClient realtimeDatabaseClient;

    public CommentFirebaseRepository(RealtimeDatabaseClient realtimeDatabaseClient) {
        this.realtimeDatabaseClient = realtimeDatabaseClient;
    }

    public void save(Comment comment) {
        Map<String, Object> commentData = toMap(comment);
        Map<String, Object> userCommentEntry = new HashMap<>();
        userCommentEntry.put("commentId", comment.commentId());
        userCommentEntry.put("postId", comment.postId());
        userCommentEntry.put("createdAt", comment.createdAt() == null ? null : comment.createdAt().toString());

        Map<String, Object> updates = new LinkedHashMap<>();
        updates.put(FirebasePath.comment(comment.postId(), comment.commentId()), commentData);
        updates.put(FirebasePath.userComment(comment.userId(), comment.commentId()), userCommentEntry);
        realtimeDatabaseClient.update(updates);
    }

    public Optional<Comment> findById(String postId, String commentId) {
        return realtimeDatabaseClient.get(FirebasePath.comment(postId, commentId), Map.class)
                .map(raw -> fromMap(postId, commentId, raw));
    }

    public List<Comment> findAllByPost(String postId) {
        Optional<Map> rawOpt = realtimeDatabaseClient.get(FirebasePath.postCommentsRoot(postId), Map.class);
        if (rawOpt.isEmpty()) {
            return List.of();
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> raw = (Map<String, Object>) rawOpt.get();
        List<Comment> result = new ArrayList<>();
        for (Map.Entry<String, Object> entry : raw.entrySet()) {
            if (!(entry.getValue() instanceof Map<?, ?> data)) {
                continue;
            }
            result.add(fromMap(postId, entry.getKey(), data));
        }
        return result;
    }

    /**
     * createdAt ASC 인덱스로 댓글 페이지를 조회한다. cursor는 {@link kr.unit.backend.common.api.CursorCodec#encode}
     * 형식이며, null/blank면 첫 페이지. 호출 측은 hasMore 판정을 위해 limit+1을 넘기는 패턴을 쓴다.
     *
     * 운영 RTDB에서는 {@code /comments/{postId}} 노드에 {@code .indexOn: ["createdAt"]}이 필요하다.
     */
    public List<Comment> queryByPostAsc(String postId, String cursor, int limitPlusOne) {
        List<QueryEntry<Map>> entries = realtimeDatabaseClient.queryByChildAsc(
                FirebasePath.postCommentsRoot(postId), "createdAt", cursor, limitPlusOne, Map.class);
        List<Comment> result = new ArrayList<>(entries.size());
        for (QueryEntry<Map> entry : entries) {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) entry.value();
            if (data == null) {
                continue;
            }
            result.add(fromMap(postId, entry.key(), data));
        }
        return result;
    }

    public void markDeleted(String postId, String commentId, Instant updatedAt) {
        String base = FirebasePath.comment(postId, commentId);
        Map<String, Object> updates = new HashMap<>();
        updates.put(base + "/deleted", true);
        updates.put(base + "/content", "삭제된 댓글입니다.");
        updates.put(base + "/updatedAt", updatedAt.toString());
        realtimeDatabaseClient.update(updates);
    }

    public boolean isLiked(String commentId, String userId) {
        return realtimeDatabaseClient.get(FirebasePath.commentLike(commentId, userId), Boolean.class)
                .orElse(false);
    }

    public void setLike(String commentId, String userId, boolean liked) {
        if (liked) {
            realtimeDatabaseClient.set(FirebasePath.commentLike(commentId, userId), true);
        } else {
            realtimeDatabaseClient.delete(FirebasePath.commentLike(commentId, userId));
        }
    }

    public long incrementCommentLikes(String commentId, long delta) {
        return realtimeDatabaseClient.increment(FirebasePath.commentStats(commentId) + "/likes", delta);
    }

    public long getCommentLikes(String commentId) {
        return realtimeDatabaseClient.get(FirebasePath.commentStats(commentId) + "/likes", Long.class)
                .orElse(0L);
    }

    public long incrementPostCommentCount(String postId, long delta) {
        return realtimeDatabaseClient.increment(FirebasePath.postStats(postId) + "/comments", delta);
    }

    private static Map<String, Object> toMap(Comment c) {
        Map<String, Object> data = new HashMap<>();
        data.put("commentId", c.commentId());
        data.put("postId", c.postId());
        data.put("userId", c.userId());
        data.put("anonymousId", c.anonymousId());
        data.put("content", c.content());
        data.put("parentCommentId", c.parentCommentId());
        data.put("deleted", c.deleted());
        data.put("createdAt", c.createdAt() == null ? null : c.createdAt().toString());
        data.put("updatedAt", c.updatedAt() == null ? null : c.updatedAt().toString());
        return data;
    }

    private static Comment fromMap(String postId, String commentId, Map<?, ?> raw) {
        return new Comment(
                commentId,
                postId,
                str(raw.get("userId")),
                str(raw.get("anonymousId")),
                str(raw.get("content")),
                emptyToNull(str(raw.get("parentCommentId"))),
                Boolean.TRUE.equals(raw.get("deleted")),
                parseInstant(str(raw.get("createdAt"))),
                parseInstant(str(raw.get("updatedAt"))));
    }

    private static String str(Object v) {
        return v == null ? null : v.toString();
    }

    private static String emptyToNull(String v) {
        return v == null || v.isBlank() ? null : v;
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
