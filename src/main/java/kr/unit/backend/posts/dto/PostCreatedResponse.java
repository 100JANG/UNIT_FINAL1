package kr.unit.backend.posts.dto;

import java.time.Instant;

public record PostCreatedResponse(
        String postId,
        String boardId,
        Instant createdAt,
        String url
) {
}
