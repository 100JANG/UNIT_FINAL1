package kr.unit.backend.reserved.controller;

import kr.unit.backend.common.api.ApiResponse;
import kr.unit.backend.common.error.ErrorCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Reserved 기능 endpoint. 어떤 실제 로직도 실행하지 않는다.
 *
 * 명시적 금지:
 *  - 학생증 OCR을 학교 이메일/학적부 검증으로 대체하지 않는다.
 *  - AI Refine을 룰/금칙어 필터로 대체하지 않는다.
 *  - AI Recap을 통계 집계로 대체하지 않는다.
 *  - Reserved 기능을 위한 Service/Repository/스케줄러를 만들지 않는다.
 *
 * 모든 응답은 501 FEATURE_RESERVED + result=null로 반환한다.
 * (사용자 정책 기준)
 */
@RestController
public class ReservedFeatureController {

    @PostMapping("/v1/auth/student-card/verify")
    public ResponseEntity<ApiResponse<Object>> verifyStudentCard() {
        return reserved();
    }

    @PostMapping("/v1/ai/refine")
    public ResponseEntity<ApiResponse<Object>> aiRefine() {
        return reserved();
    }

    @GetMapping("/v1/recap/{semester}")
    public ResponseEntity<ApiResponse<Object>> recap(@PathVariable String semester) {
        return reserved();
    }

    @GetMapping("/v1/recap/schools/{schoolId}/{semester}")
    public ResponseEntity<ApiResponse<Object>> schoolRecap(
            @PathVariable String schoolId,
            @PathVariable String semester) {
        return reserved();
    }

    private static ResponseEntity<ApiResponse<Object>> reserved() {
        ErrorCode code = ErrorCode.FEATURE_RESERVED;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }
}
