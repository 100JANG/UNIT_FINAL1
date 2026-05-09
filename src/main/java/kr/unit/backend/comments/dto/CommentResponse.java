package kr.unit.backend.comments.dto;

import kr.unit.backend.comments.domain.Comment;

import java.time.Instant;

public record CommentResponse(
        String commentId,
        String postId,
        String anonymousId,
        String content,
        String parentCommentId,
        boolean deleted,
        long likes,
        Instant createdAt
) {
    public static CommentResponse from(Comment c, long likes) {
        String content = c.deleted() ? "삭제된 댓글입니다." : c.content();
        return new CommentResponse(
                c.commentId(),
                c.postId(),
                c.anonymousId(),
                content,
                c.parentCommentId(),
                c.deleted(),
                likes,
                c.createdAt());
    }
}
