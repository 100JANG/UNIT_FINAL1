package kr.unit.backend.comments.controller;

import jakarta.validation.Valid;
import kr.unit.backend.comments.dto.CommentCreatedResponse;
import kr.unit.backend.comments.dto.CommentLikeResponse;
import kr.unit.backend.comments.dto.CommentResponse;
import kr.unit.backend.comments.dto.CreateCommentRequest;
import kr.unit.backend.comments.service.PostCommentService;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/posts/{postId}/comments")
public class PostCommentController {

    private final PostCommentService postCommentService;

    public PostCommentController(PostCommentService postCommentService) {
        this.postCommentService = postCommentService;
    }

    /**
     * 댓글 목록 조회.
     * <p>Query parameters:
     * <ul>
     *   <li>{@code cursor} (선택): 다음 페이지 cursor (직전 응답의 {@code pagination.cursor})</li>
     *   <li>{@code limit} (선택, 기본 20, 최대 50): 페이지 크기</li>
     * </ul>
     * 과거 노출 여지가 있던 {@code size} 파라미터는 더 이상 받지 않는다.
     */
    @GetMapping
    public ApiResponse<CursorPageResponse<CommentResponse>> list(
            @PathVariable String postId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(postCommentService.list(postId, cursor, limit));
    }

    @PostMapping
    public ApiResponse<CommentCreatedResponse> create(
            @PathVariable String postId,
            @AuthUser AuthenticatedUser user,
            @Valid @RequestBody CreateCommentRequest request) {
        return ApiResponse.success("댓글이 작성되었습니다",
                postCommentService.create(postId, user, request));
    }

    @PostMapping("/{commentId}/like")
    public ApiResponse<CommentLikeResponse> like(
            @PathVariable String postId,
            @PathVariable String commentId,
            @AuthUser AuthenticatedUser user) {
        return ApiResponse.success(postCommentService.toggleLike(postId, commentId, user));
    }

    @DeleteMapping("/{commentId}")
    public ApiResponse<Map<String, Object>> delete(
            @PathVariable String postId,
            @PathVariable String commentId,
            @AuthUser AuthenticatedUser user) {
        postCommentService.delete(postId, commentId, user);
        return ApiResponse.success("댓글이 삭제되었습니다",
                Map.of("commentId", commentId));
    }
}
