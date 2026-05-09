package kr.unit.backend.comments.domain;

import java.time.Instant;

/**
 * 게시글 댓글. /comments/{postId}/{commentId}와 1:1 매핑.
 *
 * 정책:
 *  - depth는 root(parentCommentId=null)와 1단계 reply(parentCommentId=root.commentId)만 허용한다.
 *  - 삭제는 hard delete가 아니라 soft delete로 처리한다 (deleted=true, content="삭제된 댓글입니다.").
 */
public record Comment(
        String commentId,
        String postId,
        String userId,
        String anonymousId,
        String content,
        String parentCommentId,
        boolean deleted,
        Instant createdAt,
        Instant updatedAt
) {
    public boolean isReply() {
        return parentCommentId != null && !parentCommentId.isBlank();
    }
}
