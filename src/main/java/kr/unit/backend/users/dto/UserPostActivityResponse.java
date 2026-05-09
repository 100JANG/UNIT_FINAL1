package kr.unit.backend.users.dto;

import java.time.Instant;

public record UserPostActivityResponse(
        String postId,
        String boardId,
        String title,
        String preview,
        Instant createdAt,
        long likes,
        long comments
) {
}
