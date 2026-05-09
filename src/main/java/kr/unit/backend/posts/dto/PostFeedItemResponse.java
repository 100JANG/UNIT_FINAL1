package kr.unit.backend.posts.dto;

import java.time.Instant;

public record PostFeedItemResponse(
        String postId,
        String boardId,
        String title,
        String preview,
        String anonymousId,
        Instant createdAt,
        PostStatsView stats
) {
    public record PostStatsView(long likes, long comments, long scraps) {
    }
}
