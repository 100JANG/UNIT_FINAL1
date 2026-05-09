package kr.unit.backend.posts.controller;

import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.posts.dto.PostScrapResponse;
import kr.unit.backend.posts.service.PostScrapService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/posts")
public class PostScrapController {

    private final PostScrapService postScrapService;

    public PostScrapController(PostScrapService postScrapService) {
        this.postScrapService = postScrapService;
    }

    @PostMapping("/{postId}/scrap")
    public ApiResponse<PostScrapResponse> toggleScrap(
            @PathVariable String postId,
            @AuthUser AuthenticatedUser user) {
        return ApiResponse.success(postScrapService.toggleScrap(postId, user));
    }
}
