package kr.unit.backend.comments.service;

import kr.unit.backend.comments.domain.Comment;
import kr.unit.backend.comments.dto.CommentCreatedResponse;
import kr.unit.backend.comments.dto.CommentLikeResponse;
import kr.unit.backend.comments.dto.CommentResponse;
import kr.unit.backend.comments.dto.CreateCommentRequest;
import kr.unit.backend.comments.policy.CommentWritePolicy;
import kr.unit.backend.comments.repository.CommentFirebaseRepository;
import kr.unit.backend.common.api.Cursor;
import kr.unit.backend.common.api.CursorCodec;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.api.PaginationLimits;
import kr.unit.backend.common.error.BusinessException;
import kr.unit.backend.common.error.ErrorCode;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.common.time.ClockProvider;
import kr.unit.backend.posts.repository.PostFirebaseRepository;
import kr.unit.backend.posts.service.PostIdGenerator;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * 댓글 도메인 유스케이스. Controller → 이 서비스 → Repository 순서로만 호출된다.
 *
 * 정책 요약:
 *  - 인증 사용자만 작성/추천/삭제 가능 (Controller @AuthUser로 강제)
 *  - depth 1까지만 허용: parentCommentId가 가리키는 댓글의 parentCommentId는 null이어야 함
 *  - 본인 댓글만 삭제 가능 (FORBIDDEN)
 *  - 삭제는 soft delete: deleted=true + content="삭제된 댓글입니다.", post_stats.comments는 감소시키지 않음
 *  - 이미 삭제된 댓글 재삭제는 idempotent하게 성공 처리
 *  - AI moderation/룰 기반 검열 없음 (Reserved)
 */
@Service
public class PostCommentService {

    private final PostFirebaseRepository postFirebaseRepository;
    private final CommentFirebaseRepository commentFirebaseRepository;
    private final CommentWritePolicy commentWritePolicy;
    private final PostIdGenerator postIdGenerator;
    private final ClockProvider clockProvider;

    public PostCommentService(PostFirebaseRepository postFirebaseRepository,
                              CommentFirebaseRepository commentFirebaseRepository,
                              CommentWritePolicy commentWritePolicy,
                              PostIdGenerator postIdGenerator,
                              ClockProvider clockProvider) {
        this.postFirebaseRepository = postFirebaseRepository;
        this.commentFirebaseRepository = commentFirebaseRepository;
        this.commentWritePolicy = commentWritePolicy;
        this.postIdGenerator = postIdGenerator;
        this.clockProvider = clockProvider;
    }

    public CommentCreatedResponse create(String postId,
                                         AuthenticatedUser author,
                                         CreateCommentRequest request) {
        commentWritePolicy.validate(request);

        if (postFirebaseRepository.findById(postId).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        String parentId = normalize(request.parentCommentId());
        if (parentId != null) {
            Comment parent = commentFirebaseRepository.findById(postId, parentId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "부모 댓글을 찾을 수 없습니다"));
            if (parent.isReply()) {
                throw new BusinessException(
                        ErrorCode.BUSINESS_RULE_VIOLATION,
                        "대댓글에는 댓글을 달 수 없습니다 (depth 1까지만 허용)");
            }
        }

        Instant now = clockProvider.now();
        String commentId = postIdGenerator.generateCommentId();
        Comment comment = new Comment(
                commentId,
                postId,
                author.userId(),
                postIdGenerator.generateAnonymousId(),
                request.content().trim(),
                parentId,
                false,
                now,
                now);

        commentFirebaseRepository.save(comment);
        commentFirebaseRepository.incrementPostCommentCount(postId, 1L);

        return new CommentCreatedResponse(comment.commentId(), postId, parentId, now);
    }

    public CursorPageResponse<CommentResponse> list(String postId, String cursor, int requestedLimit) {
        if (postFirebaseRepository.findById(postId).isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }

        int limit = PaginationLimits.clamp(requestedLimit);
        // RTDB의 orderByChild("createdAt") ASC 인덱스 쿼리로 한 페이지를 가져온다.
        // 운영에서는 /comments/{postId}에 .indexOn: ["createdAt"] 필요.
        List<Comment> queried;
        try {
            queried = commentFirebaseRepository.queryByPostAsc(postId, cursor, limit + 1);
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "cursor 형식이 올바르지 않습니다");
        }

        boolean hasMore = queried.size() > limit;
        List<Comment> page = hasMore ? queried.subList(0, limit) : queried;

        List<CommentResponse> items = new ArrayList<>(page.size());
        for (Comment c : page) {
            long likes = commentFirebaseRepository.getCommentLikes(c.commentId());
            items.add(CommentResponse.from(c, likes));
        }

        String nextCursor = null;
        if (hasMore && !page.isEmpty()) {
            Comment last = page.get(page.size() - 1);
            nextCursor = CursorCodec.encode(last.createdAt(), last.commentId());
        }
        return CursorPageResponse.of(items, Cursor.of(nextCursor, hasMore));
    }

    public CommentLikeResponse toggleLike(String postId, String commentId, AuthenticatedUser user) {
        Comment comment = commentFirebaseRepository.findById(postId, commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        // TODO(policy-review): 삭제된 댓글(soft-deleted)에 대한 좋아요 허용 여부 재검토.
        // 현재 MVP는 삭제 여부와 무관하게 좋아요 토글을 허용한다 (UX 단순성). 운영 후 피드백에 따라
        // (a) 삭제된 댓글은 NOT_FOUND처럼 처리, (b) 기존 좋아요만 유지하고 신규 추가 차단,
        // (c) 카운터 동결(±0) 중 하나로 결정 필요. 결정되면 이 메서드에 분기 추가.
        boolean wasLiked = commentFirebaseRepository.isLiked(comment.commentId(), user.userId());
        commentFirebaseRepository.setLike(comment.commentId(), user.userId(), !wasLiked);
        long updated = commentFirebaseRepository.incrementCommentLikes(
                comment.commentId(), wasLiked ? -1L : 1L);

        return new CommentLikeResponse(comment.commentId(), !wasLiked, Math.max(0L, updated));
    }

    public void delete(String postId, String commentId, AuthenticatedUser user) {
        Comment comment = commentFirebaseRepository.findById(postId, commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (!comment.userId().equals(user.userId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (comment.deleted()) {
            return;
        }
        commentFirebaseRepository.markDeleted(postId, commentId, clockProvider.now());
        // post_stats.comments는 의도적으로 감소시키지 않는다.
        // 정의: post_stats.comments = "해당 게시글에 작성된 총 댓글 수" (total comment count, never decremented on soft-delete).
        // 이유: soft-delete된 댓글도 자리(thread)는 유지되어 thread 흐름이 끊기지 않으므로,
        //      "이 글에 어느 정도 토론이 있었나"를 보여주는 지표로 누적값을 유지한다.
    }

    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

}
