package kr.unit.backend.comments.dto;

import java.time.Instant;

public record CommentCreatedResponse(
        String commentId,
        String postId,
        String parentCommentId,
        Instant createdAt
) {
}
