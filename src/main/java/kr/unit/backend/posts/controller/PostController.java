package kr.unit.backend.posts.controller;

import jakarta.validation.Valid;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.posts.dto.CreatePostRequest;
import kr.unit.backend.posts.dto.PostCreatedResponse;
import kr.unit.backend.posts.dto.PostDetailResponse;
import kr.unit.backend.posts.dto.PostFeedItemResponse;
import kr.unit.backend.posts.dto.PostLikeResponse;
import kr.unit.backend.posts.dto.ReportCreatedResponse;
import kr.unit.backend.posts.dto.ReportPostRequest;
import kr.unit.backend.posts.service.PostReportService;
import kr.unit.backend.posts.service.PostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/posts")
public class PostController {

    private final PostService postService;
    private final PostReportService postReportService;

    public PostController(PostService postService, PostReportService postReportService) {
        this.postService = postService;
        this.postReportService = postReportService;
    }

    /**
     * 피드 조회. RTDB의 /post_feeds/{scope} 인덱스를 createdAt DESC로 조회한다.
     *
     * <p>Query parameters:
     * <ul>
     *   <li>{@code scope}: {@code all} | {@code school} | {@code department} (기본 {@code all}).
     *       school/department는 인증 사용자의 RTDB 계정에서 schoolId/departmentId를 읽어 인덱스 path를 결정한다.
     *       해당 값이 미등록이면 {@code 422 BUSINESS_RULE_VIOLATION}.</li>
     *   <li>{@code boardId}: 보드 필터 (in-memory 후처리).</li>
     *   <li>{@code sort}: {@code latest} | {@code hot} | {@code comments} (기본 {@code latest}).
     *       MVP에서는 {@code latest}만 인덱스 쿼리로 구현.</li>
     *   <li>{@code cursor}: 다음 페이지 cursor (이전 응답의 {@code pagination.cursor}).</li>
     *   <li>{@code limit}: 기본 20, 최대 50.</li>
     * </ul>
     */
    @GetMapping
    public ApiResponse<CursorPageResponse<PostFeedItemResponse>> feed(
            @AuthUser AuthenticatedUser user,
            @RequestParam(required = false) String scope,
            @RequestParam(required = false) String boardId,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(postService.feed(user, scope, boardId, sort, cursor, limit));
    }

    @PostMapping
    public ApiResponse<PostCreatedResponse> create(
            @AuthUser AuthenticatedUser user,
            @Valid @RequestBody CreatePostRequest request) {
        PostCreatedResponse response = postService.createPost(user, request);
        return ApiResponse.success("게시글이 작성되었습니다", response);
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostDetailResponse> detail(@PathVariable String postId) {
        return ApiResponse.success(postService.getDetail(postId));
    }

    @PostMapping("/{postId}/like")
    public ApiResponse<PostLikeResponse> like(
            @PathVariable String postId,
            @AuthUser AuthenticatedUser user) {
        return ApiResponse.success(postService.toggleLike(postId, user));
    }

    @PostMapping("/{postId}/report")
    public ApiResponse<ReportCreatedResponse> report(
            @PathVariable String postId,
            @AuthUser AuthenticatedUser user,
            @Valid @RequestBody ReportPostRequest request) {
        ReportCreatedResponse response = postReportService.report(postId, user, request);
        return ApiResponse.success("신고가 접수되었습니다", response);
    }
}
