package kr.unit.backend.users.controller;

import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.users.dto.UserProfileResponse;
import kr.unit.backend.users.service.UserProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> me(@AuthUser AuthenticatedUser user) {
        return ApiResponse.success(userProfileService.getMyProfile(user));
    }
}
