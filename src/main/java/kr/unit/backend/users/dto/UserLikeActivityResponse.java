package kr.unit.backend.users.dto;

import java.time.Instant;

public record UserLikeActivityResponse(
        String postId,
        String boardId,
        String title,
        String preview,
        Instant likedAt
) {
}
