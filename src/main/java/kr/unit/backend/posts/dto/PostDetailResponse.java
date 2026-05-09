package kr.unit.backend.posts.dto;

import java.time.Instant;
import java.util.List;

public record PostDetailResponse(
        String postId,
        String boardId,
        String title,
        String content,
        List<String> tags,
        String anonymousId,
        String visibility,
        String status,
        Instant createdAt,
        Instant updatedAt,
        PostStatsView stats
) {
    public record PostStatsView(long likes, long comments, long scraps) {
    }
}
