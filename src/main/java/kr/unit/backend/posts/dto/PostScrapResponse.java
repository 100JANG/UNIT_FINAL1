package kr.unit.backend.posts.dto;

public record PostScrapResponse(
        String postId,
        boolean scrapped,
        long totalScraps
) {
}
