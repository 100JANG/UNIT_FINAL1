package kr.unit.backend.posts.dto;

public record PostLikeResponse(
        String postId,
        boolean liked,
        long likes
) {
}
