package kr.unit.backend.jury.controller;

import jakarta.validation.Valid;
import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.api.CursorPageResponse;
import kr.unit.backend.common.security.AuthUser;
import kr.unit.backend.common.security.AuthenticatedUser;
import kr.unit.backend.jury.dto.JuryCaseResponse;
import kr.unit.backend.jury.dto.JuryVoteRequest;
import kr.unit.backend.jury.dto.JuryVoteResponse;
import kr.unit.backend.jury.service.JuryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/jury")
public class JuryController {

    private final JuryService juryService;

    public JuryController(JuryService juryService) {
        this.juryService = juryService;
    }

    @GetMapping("/cases/{caseId}")
    public ApiResponse<JuryCaseResponse> getCase(
            @PathVariable String caseId,
            @AuthUser AuthenticatedUser user) {
        return ApiResponse.success(juryService.getCase(caseId, user));
    }

    @PostMapping("/cases/{caseId}/vote")
    public ApiResponse<JuryVoteResponse> vote(
            @PathVariable String caseId,
            @AuthUser AuthenticatedUser user,
            @Valid @RequestBody JuryVoteRequest request) {
        return ApiResponse.success("투표가 등록되었습니다", juryService.vote(caseId, user, request));
    }

    @GetMapping("/me/cases")
    public ApiResponse<CursorPageResponse<JuryCaseResponse>> listMyCases(@AuthUser AuthenticatedUser user) {
        // 호출된 jury case 목록은 RTDB jury_cases_by_department 인덱스 + summonedJurors 필터로 조회한다.
        // MVP에서는 빈 페이지로 응답하고, 후속 작업에서 인덱스 쿼리 + RTDB 구독으로 채운다.
        return ApiResponse.success(CursorPageResponse.empty());
    }
}
