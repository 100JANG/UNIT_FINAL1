package kr.unit.backend.users.controller;

import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.users.dto.UserCommentActivityResponse;
import kr.unit.backend.users.dto.UserLikeActivityResponse;
import kr.unit.backend.users.dto.UserPostActivityResponse;
import kr.unit.backend.users.dto.UserScrapActivityResponse;
import kr.unit.backend.users.dto.UserStatsResponse;
import kr.unit.backend.users.service.UserActivityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * /v1/users/me 활동 조회 endpoint 모음.
 *
 * Pagination 정책: cursor + limit (기본 20, 최대 50). {@link kr.unit.backend.common.api.CursorCodec},
 * {@link kr.unit.backend.common.api.PaginationLimits}로 통일되어 있다.
 */
@RestController
@RequestMapping("/v1/users/me")
public class UserActivityController {

    private final UserActivityService userActivityService;

    public UserActivityController(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }

    @GetMapping("/stats")
    public ApiResponse<UserStatsResponse> stats(@AuthUser AuthenticatedUser user) {
        return ApiResponse.success(userActivityService.getMyStats(user.userId()));
    }

    @GetMapping("/posts")
    public ApiResponse<CursorPageResponse<UserPostActivityResponse>> myPosts(
            @AuthUser AuthenticatedUser user,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(userActivityService.getMyPosts(user.userId(), cursor, limit));
    }

    @GetMapping("/comments")
    public ApiResponse<CursorPageResponse<UserCommentActivityResponse>> myComments(
            @AuthUser AuthenticatedUser user,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(userActivityService.getMyComments(user.userId(), cursor, limit));
    }

    @GetMapping("/likes")
    public ApiResponse<CursorPageResponse<UserLikeActivityResponse>> myLikes(
            @AuthUser AuthenticatedUser user,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(userActivityService.getMyLikes(user.userId(), cursor, limit));
    }

    @GetMapping("/scraps")
    public ApiResponse<CursorPageResponse<UserScrapActivityResponse>> myScraps(
            @AuthUser AuthenticatedUser user,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(userActivityService.getMyScraps(user.userId(), cursor, limit));
    }
}
