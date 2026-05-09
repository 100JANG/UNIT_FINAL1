package kr.unit.backend.users.dto;

import java.time.Instant;

public record UserScrapActivityResponse(
        String postId,
        String boardId,
        String boardName,
        String title,
        String preview,
        Instant createdAt,
        Instant scrappedAt,
        PostStatsView stats
) {
    public record PostStatsView(long likes, long comments, long scraps) {
    }
}
