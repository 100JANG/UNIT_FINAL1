package kr.unit.backend.auth.controller;

import jakarta.validation.Valid;
import kr.unit.backend.auth.dto.AuthRefreshRequest;
import kr.unit.backend.auth.dto.AuthSessionRequest;
import kr.unit.backend.auth.dto.AuthSessionResponse;
import kr.unit.backend.auth.service.AuthSessionService;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final AuthSessionService authSessionService;

    public AuthController(AuthSessionService authSessionService) {
        this.authSessionService = authSessionService;
    }

    @PostMapping("/session")
    public ApiResponse<AuthSessionResponse> session(@Valid @RequestBody AuthSessionRequest request) {
        return ApiResponse.success(authSessionService.issueSession(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthSessionResponse> refresh(@Valid @RequestBody AuthRefreshRequest request) {
        return ApiResponse.success(authSessionService.refresh(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Map<String, Object>> logout(@AuthUser AuthenticatedUser user) {
        authSessionService.logout(user.userId());
        return ApiResponse.success("로그아웃되었습니다", Map.of("userId", user.userId()));
    }
}
