package kr.unit.backend.comments.dto;

public record CommentLikeResponse(
        String commentId,
        boolean liked,
        long totalLikes
) {
}
