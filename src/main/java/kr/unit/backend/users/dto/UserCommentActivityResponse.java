package kr.unit.backend.users.dto;

import java.time.Instant;

public record UserCommentActivityResponse(
        String commentId,
        String postId,
        String content,
        String parentCommentId,
        boolean deleted,
        Instant createdAt
) {
}
